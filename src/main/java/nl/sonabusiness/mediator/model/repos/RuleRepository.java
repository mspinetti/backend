package nl.sonabusiness.mediator.model.repos;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Component;

import nl.sonabusiness.mediator.model.Rule;

@Component
@RepositoryRestResource
public interface RuleRepository extends CrudRepository<Rule, Long> {
	
	Rule findById(long id);
	List<Rule> findActiveRules();
}
