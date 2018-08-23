package ch.rasc.cettia.demo;

import com.fasterxml.jackson.annotation.JsonIgnore;

public class Message {
	private MessageType type;
	private String user;
	private String message;
	@JsonIgnore
	private String lang;
	private long sendDate;

	public Message withMessage(String newMessage) {
		Message messageCopy = new Message();				
		messageCopy.setMessage(newMessage);
		messageCopy.setLang(getLang());
		messageCopy.setSendDate(getSendDate());
		messageCopy.setType(getType());
		messageCopy.setUser(getUser());
		return messageCopy;
	}
	
	public String getLang() {
		return this.lang;
	}

	public void setLang(String lang) {
		this.lang = lang;
	}

	public MessageType getType() {
		return this.type;
	}

	public void setType(MessageType type) {
		this.type = type;
	}

	public String getUser() {
		return this.user;
	}

	public void setUser(String user) {
		this.user = user;
	}

	public String getMessage() {
		return this.message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public long getSendDate() {
		return this.sendDate;
	}

	public void setSendDate(long sendDate) {
		this.sendDate = sendDate;
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + (this.lang == null ? 0 : this.lang.hashCode());
		result = prime * result + (this.message == null ? 0 : this.message.hashCode());
		result = prime * result + (int) (this.sendDate ^ this.sendDate >>> 32);
		result = prime * result + (this.type == null ? 0 : this.type.hashCode());
		result = prime * result + (this.user == null ? 0 : this.user.hashCode());
		return result;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj) {
			return true;
		}
		if (obj == null) {
			return false;
		}
		if (getClass() != obj.getClass()) {
			return false;
		}
		Message other = (Message) obj;
		if (this.lang == null) {
			if (other.lang != null) {
				return false;
			}
		}
		else if (!this.lang.equals(other.lang)) {
			return false;
		}
		if (this.message == null) {
			if (other.message != null) {
				return false;
			}
		}
		else if (!this.message.equals(other.message)) {
			return false;
		}
		if (this.sendDate != other.sendDate) {
			return false;
		}
		if (this.type != other.type) {
			return false;
		}
		if (this.user == null) {
			if (other.user != null) {
				return false;
			}
		}
		else if (!this.user.equals(other.user)) {
			return false;
		}
		return true;
	}

}
