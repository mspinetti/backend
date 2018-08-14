package nl.sonabusiness.mediator;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.repository.CrudRepository;
import org.springframework.integration.annotation.IntegrationComponentScan;
import org.springframework.integration.config.EnableIntegration;
import org.springframework.scheduling.annotation.EnableScheduling;

import nl.sonabusiness.mediator.model.Rule;
import nl.sonabusiness.mediator.model.RuleManager;
import nl.sonabusiness.mediator.model.repos.RuleRepository;
import nl.sonabusiness.mediator.scheduler.Scheduler;

@SpringBootApplication
@EnableJpaRepositories
@EnableScheduling
@EnableIntegration
@IntegrationComponentScan
public class Application implements CommandLineRunner {

	@Autowired RuleRepository repository;
	@Autowired RuleManager ruleManager;
	@Autowired Scheduler scheduler;

	private static final Logger log = LoggerFactory.getLogger(Application.class);
	
	public static void main(String[] args) {
		log.info("Spring boot application starting");
		SpringApplication.run(Application.class, args);
	}
	
	@Override
	public void run(String... args) throws Exception {
		// Load rules from database
		log.info("Application run method running.");
		List<Rule> rules = (List<Rule>) repository.findActiveRules();
		log.info("Valid rules counter --> {}", rules.size());
		ruleManager.setRules(rules);
		
//		scheduler.reportMissingSequences();
	}

}
