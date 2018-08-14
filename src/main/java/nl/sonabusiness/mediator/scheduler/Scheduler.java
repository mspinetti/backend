package nl.sonabusiness.mediator.scheduler;

import java.io.UnsupportedEncodingException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import nl.sonabusiness.mediator.services.MainService;
import nl.sonabusiness.mediator.model.BillingCdr;
import nl.sonabusiness.mediator.model.repos.BillingInfoRepository;
import nl.sonabusiness.mediator.model.repos.CdrRepository;

@Component
public class Scheduler {

	@Autowired JavaMailSender javaMailSender;
	@Autowired TemplateEngine templateEngine;
	@Autowired MainService mainService;
	@Autowired BillingInfoRepository billing_repo;
	@Autowired CdrRepository cdr_repo;
	
	private static final Logger log = LoggerFactory.getLogger(Scheduler.class);
	private static final SimpleDateFormat dateFormat = new SimpleDateFormat("HH:mm:ss");

	@Scheduled(cron = "0 0 0 * * *")  // Once a day
	public void reportMissingSequences() {
		log.info("Sending mail now {}", dateFormat.format(new Date()));

		List<Integer> sequences = mainService.obtainMissingSequences();
		
		// if not missing sequences then do nothing
		if (sequences.size()==0)
			return;

		MimeMessage mail = javaMailSender.createMimeMessage();
		MimeMessageHelper helper;
		try {

			helper = new MimeMessageHelper(mail, true);
			helper.setFrom("billing@sonabusiness.nl", "SBS - Billing");
			helper.setTo("walter@sonabusiness.nl");
			helper.setSubject("Sona Mediator. Missing files");

			Context context = new Context();
			context.setVariable("sequences", sequences);
			String body = templateEngine.process("mailTemplate", context);

			helper.setText(body, true);
			javaMailSender.send(mail);
		} catch (MessagingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			log.error(e.getMessage());
		} catch (UnsupportedEncodingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			log.error(e.getMessage());
		}

	}


	@Scheduled(cron = "0 0 * * * *") // Once an hour
	public void reportBillingChanges() {
		log.info("Sending billing report notification mail now {}", dateFormat.format(new Date()));

		List<BillingCdr> changedcdrs = billing_repo.findAllPending();
		
		// if not missing sequences then do nothing
		if (changedcdrs.size()==0)
			return;

		
/*
		MimeMessage mail = javaMailSender.createMimeMessage();
		MimeMessageHelper helper;
		try {

			helper = new MimeMessageHelper(mail, true);
			helper.setFrom("billing@sonabusiness.nl", "SBS - Billing");
			helper.setTo("billing@ezitalk.eu");
			helper.setSubject("Sona Mediation Platform. Changed CDRs report");

			Context context = new Context();
			context.setVariable("changedcdrs", changedcdrs);
			String body = templateEngine.process("mailNotification", context);

			helper.setText(body, true);
			javaMailSender.send(mail);
			
		} catch (MessagingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			log.error(e.getMessage());
		} catch (UnsupportedEncodingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			log.error(e.getMessage());
		}
*/
		// Update record notification flag
		for (BillingCdr ocdr : changedcdrs) {
			ocdr.setNotified(true);
			ocdr.setNotified_date(new Date());
			billing_repo.save(ocdr);
		}

	
	}



	@Scheduled(cron = "0 0 0 * * *")  // Once a day
	public void deleteCdrsOlderThan150Days() {
		log.info("Delete cdrs older than 150 days");
		cdr_repo.deleteCdrsOlderThan150Days();
	}
}