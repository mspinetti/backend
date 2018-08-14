package nl.sonabusiness.mediator.model;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class RuleManager {

	@Autowired FileEntry fileEntry;
	
	private int groupCount;
	private String[] groupsArray = new String[10];
	private List<Rule> rules;

	public void setRules(List<Rule> r) {
		this.rules = r;
	}

	public List<Rule> getRules() {
		return rules;
	}


	private Rule findRule(String prtname, String location) {

		Rule response = null;
		for (Rule rule : rules) {
			
			if (!rule.getPrtname().equals(prtname))
				continue;
			
			Pattern pattern = Pattern.compile(rule.getLocationregex());
			Matcher matcher = pattern.matcher(location);
			while (matcher.find()) {
				response = rule;
				groupCount = matcher.groupCount();
				for (int i = 1; i <= groupCount; i++) {
					groupsArray[i - 1] = matcher.group(i);
				}
			}

			if (response != null)
				break;
		}
		return response;
	}


	public boolean doProcessing(BillingCdr ocdr, Cdr item) {

		Rule rule = findRule(item.getPrtname().toUpperCase(), item.getLocation());
		if (rule == null)
			return false;

		// CLD field
		String destination = rule.getDestination();
		for (int i = 0; i < groupCount; i++) {
			String regex = String.format("\\[\\$%d\\]", i + 1);
			destination = destination.replaceAll(regex, groupsArray[i]);
		}
		destination = destination.replaceAll("\\[\\$onr\\]", item.getOnr());
		destination = destination.replaceAll("\\[\\$nr\\]", item.getNr());
//		destination = destination.replaceAll("\\[\\$bnr\\]", item.getBnr());

		// USERNAME field
		String userName = rule.getUsername();
		userName = userName.replaceAll("\\[\\$onr\\]", item.getOnr());
		userName = userName.replaceAll("\\[\\$nr\\]", item.getNr());
//		userName = userName.replaceAll("\\[\\$bnr\\]", item.getBnr());
		

		// set output data
		if (fileEntry.getContractId().equals("1446290"))
			ocdr.setCalledStationId(String.format("\"%s_%s\"", "3G", destination));
		else
			ocdr.setCalledStationId(String.format("\"%s_%s\"", "4G", destination));
		
		ocdr.setUserName(String.format("\"%s\"", userName));
		ocdr.setH323RemoteAddress(String.format("\"%s\"", rule.getH323remoteAddress()));
		ocdr.setNasPortName(String.format("\"%s\"", rule.getNasPortName()));
		
		item.setRule_id(rule.getId().toString());
		return true;
	}

}
