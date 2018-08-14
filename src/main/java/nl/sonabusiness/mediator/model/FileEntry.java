package nl.sonabusiness.mediator.model;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.NamedStoredProcedureQuery;
import javax.persistence.StoredProcedureParameter;
import javax.persistence.ParameterMode;
import javax.persistence.Table;

import org.springframework.stereotype.Component;

@Component
@Entity
@NamedQuery(name = "FileEntry.findFiles", query = "SELECT p FROM FileEntry p ORDER BY created DESC")
@Table(name = "file_entries")
public class FileEntry {

	// input fields
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;
	private String filename;
	private String contractId;
	private String file_type;
	private int sequence;
	private int version;
	private Date created = new Date();
	private int qty_input;
	private int qty_rejected;
	private int qty_output;
	private char status;

	public FileEntry() {
		resetQs();
	}

	public void incrementQInput(int x) {
		this.qty_input += x;
	}

	public void incrementQRejected(int x) {
		this.qty_rejected += x;
	}

	public void incrementQOutput(int x) {
		this.qty_output += x;
	}

	public void resetQs() {
		this.qty_input = 0;
		this.qty_rejected = 0;
		this.qty_output = 0;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Date getCreated() {
		return created;
	}

	public void setCreated(Date created) {
		this.created = created;
	}

	public int getQty_input() {
		return qty_input;
	}

	public void setQty_input(int qty_input) {
		this.qty_input = qty_input;
	}

	public int getQty_rejected() {
		return qty_rejected;
	}

	public void setQty_rejected(int qty_rejected) {
		this.qty_rejected = qty_rejected;
	}

	public int getQty_output() {
		return qty_output;
	}

	public void setQty_output(int qty_output) {
		this.qty_output = qty_output;
	}

	public String getFilename() {
		return filename;
	}

	public void setFilename(String filename) {
		this.filename = filename;
	}

	public int getSequence() {
		return sequence;
	}

	public void setSequence(int sequence) {
		this.sequence = sequence;
	}

	public char getStatus() {
		return status;
	}

	public void setStatus(char status) {
		this.status = status;
	}

	public String getFile_type() {
		return file_type;
	}

	public void setFile_type(String file_type) {
		this.file_type = file_type;
	}

	public int getVersion() {
		return version;
	}

	public void setVersion(int version) {
		this.version = version;
	}

	public String getContractId() {
		return contractId;
	}

	public void setContractId(String contractId) {
		this.contractId = contractId;
	}

}
