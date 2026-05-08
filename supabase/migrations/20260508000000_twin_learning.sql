-- ================================================================
--   SUST v0.3 Phase 1 — Learning Foundation
--
--   feedback → σ_u / threshold / α_app への反映ループを
--   可能にするためのテーブル拡張。
-- ================================================================

-- ユーザー別 threshold (仮説ごとに feedback で適応化)
CREATE TABLE IF NOT EXISTS twin_user_thresholds (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    hypothesis TEXT NOT NULL CHECK (hypothesis ~ '^SUST-[0-9]+$'),
    threshold NUMERIC(4,3) NOT NULL DEFAULT 0.6 CHECK (threshold BETWEEN 0.2 AND 0.95),
    resonate_count INTEGER NOT NULL DEFAULT 0,
    misalign_count INTEGER NOT NULL DEFAULT 0,
    unsure_count INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, hypothesis)
);

ALTER TABLE twin_user_thresholds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_owns_thresholds" ON twin_user_thresholds
    FOR ALL USING (auth.uid() = user_id);

-- ユーザー別 α_app (アプリごとの寄与信頼度)
CREATE TABLE IF NOT EXISTS twin_user_alpha (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    app TEXT NOT NULL CHECK (app IN (
        'resonance','feelings','how-feelings-work','valuse',
        'pazst','minus','gap','evolve','narrative','atlas','mirror'
    )),
    alpha NUMERIC(4,3) NOT NULL CHECK (alpha BETWEEN 0.05 AND 0.95),
    resonate_count INTEGER NOT NULL DEFAULT 0,
    misalign_count INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, app)
);

ALTER TABLE twin_user_alpha ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_owns_alpha" ON twin_user_alpha
    FOR ALL USING (auth.uid() = user_id);

-- σ_u 変更履歴 (audit)
CREATE TABLE IF NOT EXISTS twin_sigma_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sigma_before NUMERIC(4,3),
    sigma_after NUMERIC(4,3) NOT NULL,
    source TEXT NOT NULL CHECK (source IN ('feedback','self_report','observation','reset')),
    n_signals INTEGER NOT NULL DEFAULT 0,
    note TEXT,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sigma_history_user ON twin_sigma_history(user_id, changed_at DESC);

ALTER TABLE twin_sigma_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_reads_sigma_history" ON twin_sigma_history
    FOR SELECT USING (auth.uid() = user_id);

-- contribution を軸ごとに逆引きできるビュー (どの contribution がどの軸を動かしたか)
-- mirror で "この insight は × アプリの寄与でトリガーされた" を逆引くため
CREATE OR REPLACE VIEW twin_axis_attribution_v AS
SELECT
    c.user_id,
    c.id AS contribution_id,
    c.app,
    c.server_ts,
    (jsonb_array_elements(c.axis_contributions)->>'axis')::CHAR(1) AS axis,
    jsonb_array_elements(c.axis_contributions)->>'dimension' AS dimension,
    (jsonb_array_elements(c.axis_contributions)->>'weight')::NUMERIC AS weight
FROM twin_contributions c
WHERE c.user_id IS NOT NULL;

ALTER VIEW twin_axis_attribution_v SET (security_invoker = true);

-- コメント
COMMENT ON TABLE twin_user_thresholds IS
    '仮説ごとの threshold を feedback で適応化。 初期値は 0.6 だが、 misalign が多い仮説は 高く、 resonate が多い仮説は 低くなる。';
COMMENT ON TABLE twin_user_alpha IS
    'アプリごとの α (寄与信頼度) をユーザー別に調整。 misalign を生むアプリの α は下がり、 resonate を生むアプリの α は上がる。';
COMMENT ON TABLE twin_sigma_history IS
    'σ_u の変更履歴。 個体差推定の透明性を保証。';
