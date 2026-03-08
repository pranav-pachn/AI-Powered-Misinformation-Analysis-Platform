CREATE DATABASE IF NOT EXISTS fake_news_detection CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE fake_news_detection;

DROP TABLE IF EXISTS sentence_analysis;
DROP TABLE IF EXISTS claims;
DROP TABLE IF EXISTS news_history;
DROP TABLE IF EXISTS news;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	username VARCHAR(50) NOT NULL UNIQUE,
	email VARCHAR(100) NOT NULL UNIQUE,
	password VARCHAR(255) NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Main analyzed news table
CREATE TABLE news (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	user_id INT UNSIGNED NOT NULL,
	content TEXT NOT NULL,
	source_url VARCHAR(2048) NULL,
	overall_result VARCHAR(20) NOT NULL,
	overall_confidence FLOAT NOT NULL,
	bias_type VARCHAR(50),
	bias_score FLOAT,
	emotional_tone VARCHAR(50),
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
	INDEX idx_news_user_created (user_id, created_at),
	INDEX idx_news_result (overall_result),
	INDEX idx_news_bias_type (bias_type),
	INDEX idx_news_source_url (source_url(768))
);

-- Extracted claims per article
CREATE TABLE claims (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	news_id INT UNSIGNED NOT NULL,
	claim_text TEXT NOT NULL,
	explanation TEXT,
	verdict VARCHAR(20) NOT NULL,
	confidence FLOAT NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE,
	INDEX idx_claims_news (news_id),
	INDEX idx_claims_verdict (verdict)
);

-- Sentence-level risk analysis
CREATE TABLE sentence_analysis (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	news_id INT UNSIGNED NOT NULL,
	sentence_text TEXT NOT NULL,
	risk_level VARCHAR(20) NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE,
	INDEX idx_sentence_news (news_id),
	INDEX idx_sentence_risk (risk_level)
);
