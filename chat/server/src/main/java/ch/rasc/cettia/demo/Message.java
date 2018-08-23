package ch.rasc.cettia.demo;

public class Message {
	private MessageType type;
	private String user;
	private String message;
	private long sendDate;

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
