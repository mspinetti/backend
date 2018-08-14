package nl.sonabusiness.mediator.batch;

import java.util.List;

import org.springframework.batch.core.StepExecution;
import org.springframework.batch.core.annotation.BeforeStep;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import nl.sonabusiness.mediator.model.Cdr;
import nl.sonabusiness.mediator.model.FileEntry;
import nl.sonabusiness.mediator.model.BillingCdr;
import nl.sonabusiness.mediator.model.RejectedCdr;
import nl.sonabusiness.mediator.model.RuleManager;
import nl.sonabusiness.mediator.model.repos.BillingInfoRepository;
import nl.sonabusiness.mediator.model.repos.CdrRepository;
import nl.sonabusiness.mediator.model.repos.RejectedCdrRepository;

public class CdrItemProcessor implements ItemProcessor<Cdr, BillingCdr> {

	@Autowired RuleManager ruleManager;
	@Autowired FileEntry fileEntry;
	@Autowired CdrRepository cdr_repo;
	@Autowired RejectedCdrRepository rej_repo;
	@Autowired BillingInfoRepository billing_repo;

	@Override
	public BillingCdr process(Cdr item) throws Exception {

		BillingCdr ocdr = new BillingCdr();
		ocdr.setFileName(fileEntry.getFilename());
		ocdr.setFileType(fileEntry.getFile_type());
		boolean bNotify = false;

		// Header case
		if (item.getRatop().equals("ratop")) {
			ocdr.setUserName(String.format("\"%s\"", "User-Name"));
			ocdr.setPortaOneServiceType(String.format("\"%s\"", "PortaOne-Service-Type"));
			ocdr.setH323ConnectTime(String.format("\"%s\"", "h323-connect-time"));
			ocdr.setAcctSessionTime(String.format("\"%s\"", "Acct-Session-Time"));
			ocdr.setCallingStationId(String.format("\"%s\"", "CLI"));
			ocdr.setCalledStationId(String.format("\"%s\"", "CLD"));
			ocdr.setH323RemoteAddress(String.format("\"%s\"", "h323-remote-address"));
			ocdr.setNasPortName(String.format("\"%s\"", "NAS-Port-Name"));
			ocdr.setH323RemoteId(String.format("\"%s\"", "h323-remote-id"));
			ocdr.setPortaOneUsedResource(String.format("\"%s\"", "PortaOne-Used-Resource"));
			ocdr.setAcctOutputOctets(String.format("\"%s\"", "Acct-Output-Octets"));
			ocdr.setRated(String.format("\"%s\"", "Rated"));
			return ocdr;
		}

		fileEntry.incrementQInput(1);

		item.setFile_id(Long.toString(fileEntry.getId()));

		// Discard input record
		float rated = Float.parseFloat(item.getRated());
		if (item.getPrtname().equals("Voice") && rated==0.0) {
			saveRejectedRecord(item, "RATE_IS_ZERO");
			return null;
		}

		switch (fileEntry.getFile_type()) {
		case "ADD":
			item = cdr_repo.save(item);
			break;

		case "CHG":
			// Look for original cdr 150 days ago maximum
			List<Cdr> list1 = cdr_repo.findCdr(item.getSeq_id(), item.getRatop(), item.getDate());
			if (list1.size() > 0) {
				bNotify = true;
				// Flag notification!!!!!
			} else {
				saveRejectedRecord(item, "CHG_RECORD_TOO_OLD");
				return null;
			}
			break;

		case "DEL":
			// Look for original cdr 150 days ago maximum
			List<Cdr> list2 = cdr_repo.findCdr(item.getSeq_id(), item.getRatop(), item.getDate());
			if (list2.size() > 0) {
				Cdr cdr = list2.get(0);
				// Reverse charge
				float amount = Float.parseFloat(cdr.getAmount());
				amount *= -1;
				item.setAmount(String.format("%f", amount));
				bNotify = true;

			} else {
				saveRejectedRecord(item, "DEL_RECORD_TOO_OLD");
				return null;
			}
			break;
		}

		// Fixed mappings
		float ammount = Float.parseFloat(item.getAmount());
		ocdr.setPortaOneServiceType(String.format("\"%s\"", item.getPrtname()));
		ocdr.setH323ConnectTime(String.format("\"%s %s\"", item.getDate(), item.getTime().substring(0, 5)));
		ocdr.setAcctSessionTime(String.format("\"%.0f\"", ammount));
		ocdr.setCallingStationId(String.format("\"%s\"", item.getOnr()));
		ocdr.setPortaOneUsedResource(String.format("\"%.0f\"", ammount));
		ocdr.setAcctOutputOctets(String.format("\"%.0f\"", ammount));
		ocdr.setRated(String.format("\"%s\"", item.getRated()));

		if (item.getPrtname().equals("Voice"))
			ocdr.setH323RemoteId(String.format("\"%s\"", ""));
		else
			ocdr.setH323RemoteId(String.format("\"%s\"", "1.1.1.1"));

		// If not rule then reject record
		if (!ruleManager.doProcessing(ocdr, item)) {
			saveRejectedRecord(item, "RULE_NOT_FOUND");
			return null;
		}

		// Process record
		fileEntry.incrementQOutput(1);

		if (bNotify) {
			billing_repo.save(ocdr);
		}
		return ocdr;
	}

	
	private void saveRejectedRecord(Cdr source_item, String msg) {
		RejectedCdr rejCdr = new RejectedCdr();
		BeanUtils.copyProperties(source_item, rejCdr);
		rejCdr.setRejection_cause(msg);
		rej_repo.save(rejCdr);
		fileEntry.incrementQRejected(1);
	}

}
