package ch.rasc.cettia.demo;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public class AppConfig {
	private String credentialsPath;

	private long limitTranslationCharacters;

	public String getCredentialsPath() {
		return this.credentialsPath;
	}

	public void setCredentialsPath(String credentialsPath) {
		this.credentialsPath = credentialsPath;
	}

	public long getLimitTranslationCharacters() {
		return this.limitTranslationCharacters;
	}

	public void setLimitTranslationCharacters(long limitTranslationCharacters) {
		this.limitTranslationCharacters = limitTranslationCharacters;
	}

}
