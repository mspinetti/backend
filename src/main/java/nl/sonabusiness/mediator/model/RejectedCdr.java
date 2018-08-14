package nl.sonabusiness.mediator.model;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.NamedQuery;
import javax.persistence.Table;

import org.springframework.stereotype.Component;

@Component
@Entity
@Table(name = "rejected_cdrs1")
public class RejectedCdr extends AbstractCdr {

	// non input fields
	private String rejection_cause;

	public String getRejection_cause() {
		return rejection_cause;
	}
	public void setRejection_cause(String rejection_cause) {
		this.rejection_cause = rejection_cause;
	}
	
	
	
}