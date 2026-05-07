-- ================================================================
--   Solnova Digital Twin — Database Schema (SUST v0.2)
--   Postgres / Supabase
-- ================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 同意
CREATE TABLE IF NOT EXISTS twin_consent (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    level TEXT NOT NULL CHECK (level IN ('L0','L1','L2','L3')) DEFAULT 'L1',
    insights_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    aggregate_participation BOOLEAN NOT NULL DEFAULT FALSE,
    longitudinal_participation BOOLEAN NOT NULL DEFAULT FALSE,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE twin_consent ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_owns_consent" ON twin_consent FOR ALL USING (auth.uid() = user_id);

-- 個体差 σ_u
CREATE TABLE IF NOT EXISTS twin_sigma (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    sigma NUMERIC(4,3) NOT NULL DEFAULT 1.000 CHECK (sigma BETWEEN 0.7 AND 1.4),
    source TEXT NOT NULL CHECK (source IN ('self_report','observation','hybrid')) DEFAULT 'hybrid',
    hsp_score NUMERIC(4,2),
    observation_n INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE twin_sigma ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_owns_sigma" ON twin_sigma FOR ALL USING (auth.uid() = user_id);

-- Morpho Profile (13 軸)
CREATE TABLE IF NOT EXISTS twin_morpho_axis (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    axis CHAR(1) NOT NULL CHECK (axis IN ('A','B','C','D','E','F','G','H','I','J','K','L','M')),
    mu JSONB NOT NULL,
    variance JSONB NOT NULL,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    observation_count INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, axis)
);
CREATE INDEX IF NOT EXISTS idx_morpho_user    ON twin_morpho_axis(user_id);
CREATE INDEX IF NOT EXISTS idx_morpho_updated ON twin_morpho_axis(last_updated DESC);
ALTER TABLE twin_morpho_axis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_owns_morpho" ON twin_morpho_axis FOR ALL USING (auth.uid() = user_id);

-- 寄与ログ (append-only)
CREATE TABLE IF NOT EXISTS twin_contributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    app TEXT NOT NULL CHECK (app IN ('resonance','feelings','how-feelings-work','valuse','pazst','minus','gap','evolve')),
    payload JSONB NOT NULL,
    payload_hash TEXT NOT NULL,
    axis_contributions JSONB NOT NULL,
    alpha_app NUMERIC(4,3) NOT NULL,
    sigma_u NUMERIC(4,3) NOT NULL,
    server_ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    client_ts TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_contrib_user_ts ON twin_contributions(user_id, server_ts DESC);
CREATE INDEX IF NOT EXISTS idx_contrib_app     ON twin_contributions(app);
CREATE INDEX IF NOT EXISTS idx_contrib_hash    ON twin_contributions(payload_hash);
ALTER TABLE twin_contributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_reads_own_contributions" ON twin_contributions FOR SELECT USING (auth.uid() = user_id);

-- 日次スナップショット
CREATE TABLE IF NOT EXISTS twin_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL,
    morpho JSONB NOT NULL,
    sigma NUMERIC(4,3) NOT NULL,
    UNIQUE (user_id, snapshot_date)
);
CREATE INDEX IF NOT EXISTS idx_history_user_date ON twin_history(user_id, snapshot_date DESC);
ALTER TABLE twin_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_owns_history" ON twin_history FOR ALL USING (auth.uid() = user_id);

-- 仮説スコア
CREATE TABLE IF NOT EXISTS twin_hypotheses (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    hypothesis TEXT NOT NULL CHECK (hypothesis ~ '^SUST-[0-9]+$'),
    score NUMERIC(4,3) NOT NULL CHECK (score BETWEEN 0 AND 1),
    threshold NUMERIC(4,3) NOT NULL DEFAULT 0.6,
    fired BOOLEAN NOT NULL DEFAULT FALSE,
    evidence_axes TEXT[] NOT NULL,
    evidence_summary JSONB,
    last_evaluated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, hypothesis)
);
CREATE INDEX IF NOT EXISTS idx_hypothesis_fired ON twin_hypotheses(user_id) WHERE fired = TRUE;
ALTER TABLE twin_hypotheses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_owns_hypotheses" ON twin_hypotheses FOR ALL USING (auth.uid() = user_id);

-- Insight カード
CREATE TABLE IF NOT EXISTS twin_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('observation','pattern','hypothesis','invitation','caution')),
    trigger TEXT NOT NULL CHECK (trigger IN ('hypothesis_fired','drift_detected','periodic','conflict')),
    axes_referenced TEXT[] NOT NULL,
    hypothesis_id TEXT,
    confidence NUMERIC(4,3) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    actions JSONB NOT NULL DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    feedback TEXT CHECK (feedback IN ('resonated','misaligned','unsure')),
    feedback_at TIMESTAMPTZ,
    feedback_note TEXT
);
CREATE INDEX IF NOT EXISTS idx_insight_user_active ON twin_insights(user_id, created_at DESC) WHERE expires_at > NOW() AND feedback IS NULL;
CREATE INDEX IF NOT EXISTS idx_insight_feedback    ON twin_insights(user_id, feedback);
ALTER TABLE twin_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_owns_insights" ON twin_insights FOR ALL USING (auth.uid() = user_id);

-- 衝突レポート
CREATE TABLE IF NOT EXISTS twin_conflicts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    axis CHAR(1) NOT NULL,
    dimension TEXT NOT NULL,
    conflict_score NUMERIC(4,3) NOT NULL,
    contributors JSONB NOT NULL,
    resolution_strategy TEXT NOT NULL,
    resolved BOOLEAN NOT NULL DEFAULT FALSE,
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_conflict_user_open ON twin_conflicts(user_id) WHERE resolved = FALSE;
ALTER TABLE twin_conflicts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_reads_conflicts" ON twin_conflicts FOR SELECT USING (auth.uid() = user_id);

-- 集団事前分布
CREATE TABLE IF NOT EXISTS twin_population_prior (
    axis CHAR(1) NOT NULL,
    dimension TEXT NOT NULL,
    mu_pop NUMERIC(8,4) NOT NULL,
    variance_pop NUMERIC(8,4) NOT NULL,
    n INTEGER NOT NULL,
    computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (axis, dimension, computed_at)
);
CREATE INDEX IF NOT EXISTS idx_prior_latest ON twin_population_prior(axis, dimension, computed_at DESC);

-- 軸メタ (定数)
CREATE TABLE IF NOT EXISTS twin_axis_meta (
    axis CHAR(1) PRIMARY KEY,
    name TEXT NOT NULL,
    layer TEXT NOT NULL CHECK (layer IN ('I','II','III','IV')),
    dim INTEGER NOT NULL,
    beta NUMERIC(3,2) NOT NULL,
    tau_days INTEGER NOT NULL,
    default_update_rate NUMERIC(4,3) NOT NULL,
    dimensions TEXT[] NOT NULL
);

INSERT INTO twin_axis_meta VALUES
('A','Developmental Origin','I',12,0.0,3650,0.05,ARRAY['age_0_5_family','age_0_5_school','age_0_5_events','age_6_10_family','age_6_10_school','age_6_10_events','age_11_15_family','age_11_15_school','age_11_15_events','age_16_20_family','age_16_20_school','age_16_20_events']),
('B','Temporal Structure Preference','I',9,0.0,365,0.08,ARRAY['type_I','type_II','type_III','type_IV','type_V','type_VI','type_VII','type_VIII','type_IX']),
('C','Awakening Phase','I',1,0.0,365,0.10,ARRAY['awakening_stage']),
('D','Needs Satisfaction','II',10,0.5,180,0.15,ARRAY['recognition','love','safety','freedom','order','achievement','expression','belonging','fairness','trust']),
('E','Value Hierarchy','II',11,0.5,180,0.15,ARRAY['cat_moral','cat_social','cat_personal','cat_spiritual','cat_intellectual','cat_aesthetic','cat_economic','maslow_safety','maslow_belonging','maslow_esteem','maslow_self_actualization']),
('F','Self-Boundary Topology','II',6,0.5,180,0.18,ARRAY['domain_relationship','domain_environment','domain_work','domain_time','domain_values','overall_level']),
('G','Emotion Intensity','III',28,1.0,60,0.30,ARRAY['joy','sadness','anger','fear','surprise','disgust','love','gratitude','pride','hope','relief','curiosity','awe','flow','elevation','contentment','anxiety','grief','disappointment','regret','boredom','loneliness','frustration','nostalgia','jealousy','envy','shame','guilt']),
('H','Emotion Sensitivity','III',28,1.0,60,0.30,ARRAY['joy','sadness','anger','fear','surprise','disgust','love','gratitude','pride','hope','relief','curiosity','awe','flow','elevation','contentment','anxiety','grief','disappointment','regret','boredom','loneliness','frustration','nostalgia','jealousy','envy','shame','guilt']),
('I','Emotion Duration','III',28,1.0,60,0.25,ARRAY['joy','sadness','anger','fear','surprise','disgust','love','gratitude','pride','hope','relief','curiosity','awe','flow','elevation','contentment','anxiety','grief','disappointment','regret','boredom','loneliness','frustration','nostalgia','jealousy','envy','shame','guilt']),
('J','Expression Style','IV',4,0.7,30,0.50,ARRAY['humor','empathy','suppression','explosiveness']),
('K','Relational Openness','IV',5,0.7,30,0.50,ARRAY['rel_workplace','rel_family','rel_romance','rel_friend','rel_society']),
('L','Emotion Transition Preferences','IV',8,0.7,30,0.40,ARRAY['pc_1','pc_2','pc_3','pc_4','pc_5','pc_6','pc_7','pc_8']),
('M','Narrative Coherence','IV',8,0.5,90,0.30,ARRAY['intra_layer_coherence','cross_layer_coherence','temporal_coherence','cross_app_coherence','self_rated_coherence','productive_contradiction','integration_phase','revisability'])
ON CONFLICT (axis) DO UPDATE SET name=EXCLUDED.name,layer=EXCLUDED.layer,dim=EXCLUDED.dim,beta=EXCLUDED.beta,tau_days=EXCLUDED.tau_days,default_update_rate=EXCLUDED.default_update_rate,dimensions=EXCLUDED.dimensions;

-- forget 関数
CREATE OR REPLACE FUNCTION twin_forget_user(target_user_id UUID) RETURNS VOID AS $$
BEGIN
    UPDATE twin_contributions SET user_id=NULL, payload='{}'::JSONB WHERE user_id=target_user_id;
    DELETE FROM twin_morpho_axis WHERE user_id=target_user_id;
    DELETE FROM twin_history     WHERE user_id=target_user_id;
    DELETE FROM twin_hypotheses  WHERE user_id=target_user_id;
    DELETE FROM twin_insights    WHERE user_id=target_user_id;
    DELETE FROM twin_conflicts   WHERE user_id=target_user_id;
    DELETE FROM twin_sigma       WHERE user_id=target_user_id;
    DELETE FROM twin_consent     WHERE user_id=target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 日次スナップショット関数
CREATE OR REPLACE FUNCTION twin_take_daily_snapshot() RETURNS INTEGER AS $$
DECLARE cnt INTEGER := 0;
BEGIN
    INSERT INTO twin_history (user_id, snapshot_date, morpho, sigma)
    SELECT m.user_id, CURRENT_DATE, jsonb_object_agg(m.axis, m.mu), COALESCE(s.sigma,1.000)
    FROM twin_morpho_axis m LEFT JOIN twin_sigma s ON s.user_id=m.user_id
    GROUP BY m.user_id, s.sigma
    ON CONFLICT (user_id, snapshot_date) DO NOTHING;
    GET DIAGNOSTICS cnt = ROW_COUNT;
    RETURN cnt;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- insight 期限切れクリーンアップ
CREATE OR REPLACE FUNCTION twin_cleanup_expired_insights() RETURNS INTEGER AS $$
DECLARE cnt INTEGER;
BEGIN
    DELETE FROM twin_insights WHERE expires_at < NOW() AND feedback IS NULL;
    GET DIAGNOSTICS cnt = ROW_COUNT;
    RETURN cnt;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Twin 概要ビュー
CREATE OR REPLACE VIEW twin_summary_v AS
SELECT
    c.user_id,
    c.level AS consent_level,
    s.sigma,
    (SELECT COUNT(*) FROM twin_contributions tc WHERE tc.user_id=c.user_id) AS total_contributions,
    (SELECT COUNT(*) FROM twin_insights ti WHERE ti.user_id=c.user_id AND ti.expires_at>NOW() AND ti.feedback IS NULL) AS active_insights,
    (SELECT COUNT(*) FROM twin_hypotheses th WHERE th.user_id=c.user_id AND th.fired) AS fired_hypotheses,
    (SELECT COUNT(*) FROM twin_conflicts tcf WHERE tcf.user_id=c.user_id AND NOT tcf.resolved) AS open_conflicts,
    (SELECT MAX(last_updated) FROM twin_morpho_axis tm WHERE tm.user_id=c.user_id) AS last_morpho_update
FROM twin_consent c LEFT JOIN twin_sigma s ON s.user_id=c.user_id;

ALTER VIEW twin_summary_v SET (security_invoker = true);
