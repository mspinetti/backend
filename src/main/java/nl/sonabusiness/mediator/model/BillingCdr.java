package nl.sonabusiness.mediator.model;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;

import org.springframework.stereotype.Component;

@Component
@Entity
@Table(name = "billing_info")
public class BillingCdr {

	@Id @GeneratedValue @Column protected String id;
	private String fileName;
	private String fileType;
	private String userName;
	private String portaOneServiceType;
	private String h323ConnectTime;
	private String acctSessionTime;
	private String callingStationId;
	private String calledStationId;
	private String h323RemoteAddress;
	private String nasPortName;
	private String h323RemoteId;
	private String portaOneUsedResource;
	private String acctOutputOctets;
	private String rated;
	private boolean notified;
	private Date notified_date = new Date();
	
	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getFileName() {
		return fileName;
	}

	public void setFileName(String fileName) {
		this.fileName = fileName;
	}

	public String getFileType() {
		return fileType;
	}

	public void setFileType(String fileType) {
		this.fileType = fileType;
	}
	
	public String getUserName() {
		return userName;
	}

	public void setUserName(String userName) {
		this.userName = userName;
	}

	public String getPortaOneServiceType() {
		return portaOneServiceType;
	}

	public void setPortaOneServiceType(String portaOneServiceType) {
		this.portaOneServiceType = portaOneServiceType;
	}

	public String getH323ConnectTime() {
		return h323ConnectTime;
	}

	public void setH323ConnectTime(String h323ConnectTime) {
		this.h323ConnectTime = h323ConnectTime;
	}

	public String getAcctSessionTime() {
		return acctSessionTime;
	}

	public void setAcctSessionTime(String acctSessionTime) {
		this.acctSessionTime = acctSessionTime;
	}

	public String getCallingStationId() {
		return callingStationId;
	}

	public void setCallingStationId(String callingStationId) {
		this.callingStationId = callingStationId;
	}

	public String getCalledStationId() {
		return calledStationId;
	}

	public void setCalledStationId(String calledStationId) {
		this.calledStationId = calledStationId;
	}

	public String getH323RemoteAddress() {
		return h323RemoteAddress;
	}

	public void setH323RemoteAddress(String h323RemoteAddress) {
		this.h323RemoteAddress = h323RemoteAddress;
	}

	public String getNasPortName() {
		return nasPortName;
	}

	public void setNasPortName(String nasPortName) {
		this.nasPortName = nasPortName;
	}

	public String getH323RemoteId() {
		return h323RemoteId;
	}

	public void setH323RemoteId(String h323RemoteId) {
		this.h323RemoteId = h323RemoteId;
	}

	public String getPortaOneUsedResource() {
		return portaOneUsedResource;
	}

	public void setPortaOneUsedResource(String portaOneUsedResource) {
		this.portaOneUsedResource = portaOneUsedResource;
	}

	public String getAcctOutputOctets() {
		return acctOutputOctets;
	}

	public void setAcctOutputOctets(String acctOutputOctets) {
		this.acctOutputOctets = acctOutputOctets;
	}

	public String getRated() {
		return rated;
	}

	public void setRated(String rated) {
		this.rated = rated;
	}
	public boolean isNotified() {
		return notified;
	}

	public void setNotified(boolean notified) {
		this.notified = notified;
	}

	public Date getNotified_date() {
		return notified_date;
	}

	public void setNotified_date(Date notified_date) {
		this.notified_date = notified_date;
	}

}
