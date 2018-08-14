package nl.sonabusiness.mediator.services;

import java.util.Date;
import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.ParameterMode;
import javax.persistence.StoredProcedureQuery;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import nl.sonabusiness.mediator.model.Cdr;
import nl.sonabusiness.mediator.model.FileEntry;
import nl.sonabusiness.mediator.model.RejectedCdr;
import nl.sonabusiness.mediator.model.Rule;
import nl.sonabusiness.mediator.model.repos.CdrRepository;
import nl.sonabusiness.mediator.model.repos.FileEntryRepository;
import nl.sonabusiness.mediator.model.repos.RejectedCdrRepository;
import nl.sonabusiness.mediator.model.repos.RuleRepository;

@CrossOrigin(origins = "*")
@RestController
public class MainController {

	@Autowired RuleRepository repository;
	@Autowired FileEntryRepository fe_repository;
	@Autowired RejectedCdrRepository rejected_repo;
	
	@RequestMapping(value = "/reglas", method = RequestMethod.GET)
	public List<Rule> getRules() {
//		List<Rule> movies = (List<Rule>) repository.findAll();
		List<Rule> rules = (List<Rule>) repository.findActiveRules();
		return rules;
	}

	@RequestMapping(value = "/reglas", method = RequestMethod.POST)
	public ResponseEntity<Rule> addRule(@RequestBody Rule rule) {
		repository.save(rule);
		return new ResponseEntity<Rule>(rule, HttpStatus.OK);
	}

	@RequestMapping(value = "/reglas/{id}", method = RequestMethod.PUT)
	public ResponseEntity<Rule> updateRule(@PathVariable("id") long id, @RequestBody Rule rule) {

		Rule currentRule = repository.findById(id);

		if (currentRule == null) {
			System.out.println("User with id " + id + " not found");
			return new ResponseEntity<Rule>(HttpStatus.NOT_FOUND);
		}

		rule.setModified(new Date());
		repository.save(rule);
		return new ResponseEntity<Rule>(rule, HttpStatus.OK);
	}
/*
	// NOT USED AT THE MOMENT //
	@RequestMapping(value = "/files_paged", method = RequestMethod.GET)
	public Page<FileEntry> getFiles(@RequestParam("page") int page, @RequestParam("pagesize") int pagesize) {
		Page<FileEntry> list = (Page<FileEntry>) fe_repository.findAllByOrderBySequenceDesc(new PageRequest(page, pagesize));
		return list;
	}
*/
	@RequestMapping(value = "/files", method = RequestMethod.GET)
	public List<FileEntry> getFiles1() {
		List<FileEntry> list = (List<FileEntry>) fe_repository.findAllByOrderBySequenceDesc();
		return list;
	}

	@RequestMapping(value = "/rejectedcdrs", method = RequestMethod.GET)
	public List<RejectedCdr> getRejectedCdrs() {
		List<RejectedCdr> list = (List<RejectedCdr>) rejected_repo.findAll();
		return list;
	}


}
