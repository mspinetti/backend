package nl.sonabusiness.mediator.model;

import javax.persistence.Column;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.MappedSuperclass;

@MappedSuperclass
public abstract class AbstractCdr {

	@Id @GeneratedValue @Column protected String id;
	@Column protected String seq_id;
	@Column protected String date;
	@Column protected String time;
	@Column protected String ratop;
	@Column protected String onr;
	@Column protected String nr;
	@Column protected String bnrmask;
	@Column protected String prtname;
	@Column protected String prtcode;
	@Column protected String oreg;
	@Column protected String oregname;
	@Column protected String reg;
	@Column protected String regname;
	@Column protected String oopcode;
	@Column protected String opcode;
	@Column protected String contractcode;
	@Column protected String gwname;
	@Column protected String custname;
	@Column protected String location;
	@Column protected String location1;
	@Column protected String amount;
	@Column protected String unit;
	@Column protected String rated;
	@Column protected String csc;
	@Column protected String rate;
	@Column protected String csc2;
	@Column protected String rate2;
	@Column protected String ratetype;
	@Column protected String rateid;
	@Column protected String vat;
	@Column protected String custcode;
	@Column protected String cref_id;
	@Column protected String file_id;

	
	public String getSeq_id() {
		return seq_id;
	}
	public void setSeq_id(String seq_id) {
		this.seq_id = seq_id;
	}
	public String getDate() {
		return date;
	}
	public void setDate(String date) {
		this.date = date;
	}
	public String getTime() {
		return time;
	}
	public void setTime(String time) {
		this.time = time;
	}
	public String getRatop() {
		return ratop;
	}
	public void setRatop(String ratop) {
		this.ratop = ratop;
	}
	public String getOnr() {
		return onr;
	}
	public void setOnr(String onr) {
		this.onr = onr;
	}
	public String getNr() {
		return nr;
	}
	public void setNr(String nr) {
		this.nr = nr;
	}
	public String getBnrmask() {
		return bnrmask;
	}
	public void setBnrmask(String bnrmask) {
		this.bnrmask = bnrmask;
	}
	public String getPrtname() {
		return prtname;
	}
	public void setPrtname(String prtname) {
		this.prtname = prtname;
	}
	public String getPrtcode() {
		return prtcode;
	}
	public void setPrtcode(String prtcode) {
		this.prtcode = prtcode;
	}
	public String getOreg() {
		return oreg;
	}
	public void setOreg(String oreg) {
		this.oreg = oreg;
	}
	public String getOregname() {
		return oregname;
	}
	public void setOregname(String oregname) {
		this.oregname = oregname;
	}
	public String getReg() {
		return reg;
	}
	public void setReg(String reg) {
		this.reg = reg;
	}
	public String getRegname() {
		return regname;
	}
	public void setRegname(String regname) {
		this.regname = regname;
	}
	public String getOopcode() {
		return oopcode;
	}
	public void setOopcode(String oopcode) {
		this.oopcode = oopcode;
	}
	public String getOpcode() {
		return opcode;
	}
	public void setOpcode(String opcode) {
		this.opcode = opcode;
	}
	public String getContractcode() {
		return contractcode;
	}
	public void setContractcode(String contractcode) {
		this.contractcode = contractcode;
	}
	public String getGwname() {
		return gwname;
	}
	public void setGwname(String gwname) {
		this.gwname = gwname;
	}
	public String getCustname() {
		return custname;
	}
	public void setCustname(String custname) {
		this.custname = custname;
	}
	public String getLocation() {
		return location;
	}
	public void setLocation(String location) {
		this.location = location;
	}
	public String getLocation1() {
		return location1;
	}
	public void setLocation1(String location1) {
		this.location1 = location1;
	}
	public String getAmount() {
		return amount;
	}
	public void setAmount(String amount) {
		this.amount = amount;
	}
	public String getUnit() {
		return unit;
	}
	public void setUnit(String unit) {
		this.unit = unit;
	}
	public String getRated() {
		return rated;
	}
	public void setRated(String rated) {
		this.rated = rated;
	}
	public String getCsc() {
		return csc;
	}
	public void setCsc(String csc) {
		this.csc = csc;
	}
	public String getRate() {
		return rate;
	}
	public void setRate(String rate) {
		this.rate = rate;
	}
	public String getCsc2() {
		return csc2;
	}
	public void setCsc2(String csc2) {
		this.csc2 = csc2;
	}
	public String getRate2() {
		return rate2;
	}
	public void setRate2(String rate2) {
		this.rate2 = rate2;
	}
	public String getRatetype() {
		return ratetype;
	}
	public void setRatetype(String ratetype) {
		this.ratetype = ratetype;
	}
	public String getRateid() {
		return rateid;
	}
	public void setRateid(String rateid) {
		this.rateid = rateid;
	}
	public String getVat() {
		return vat;
	}
	public void setVat(String vat) {
		this.vat = vat;
	}
	public String getCustcode() {
		return custcode;
	}
	public void setCustcode(String custcode) {
		this.custcode = custcode;
	}
	public String getCref_id() {
		return cref_id;
	}
	public void setCref_id(String cref_id) {
		this.cref_id = cref_id;
	}
	public String getFile_id() {
		return file_id;
	}
	public void setFile_id(String file_id) {
		this.file_id = file_id;
	}
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}

}
