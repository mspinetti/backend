package nl.sonabusiness.mediator.model;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.NamedQuery;
import javax.persistence.Table;

@Entity
@NamedQuery(name = "Rule.findActiveRules", query = "SELECT p FROM Rule p WHERE active=true ORDER BY prtname,priority ASC")
@Table(name = "rules")
public class Rule {

	// input fields
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;
	private Long priority;
	private String prtname;
	private String locationregex;
	private String destination;
	private String username;
	
	@Column(name = "h323remote_address")
	private String h323remoteAddress;

	@Column(name = "nas_port_name")
	private String nasPortName;
	
	private boolean active = true;
	private Date created = new Date();
	private Date modified;

	public Rule() {
	}

	@Override
	public String toString() {
		return String.format("Rule[id=%d, prtName='%s', location='%s', destination='%s']", id, prtname, locationregex,
				destination);
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getPriority() {
		return priority;
	}

	public void setPriority(Long priority) {
		this.priority = priority;
	}

	public String getPrtname() {
		return prtname;
	}

	public void setPrtname(String prtname) {
		this.prtname = prtname;
	}

	public String getLocationregex() {
		return locationregex;
	}

	public void setLocationregex(String locationregex) {
		this.locationregex = locationregex;
	}

	public String getDestination() {
		return destination;
	}

	public void setDestination(String destination) {
		this.destination = destination;
	}

	public String getNasPortName() {
		return nasPortName;
	}

	public void setNasPortName(String nasPortName) {
		this.nasPortName = nasPortName;
	}

	public String getH323remoteAddress() {
		return h323remoteAddress;
	}

	public void setH323remoteAddress(String h323remoteAddress) {
		this.h323remoteAddress = h323remoteAddress;
	}
	
	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public boolean isActive() {
		return active;
	}

	public void setActive(boolean active) {
		this.active = active;
	}

	public Date getCreated() {
		return created;
	}

	public void setCreated(Date created) {
		this.created = created;
	}

	public Date getModified() {
		return modified;
	}

	public void setModified(Date modified) {
		this.modified = modified;
	}


}
