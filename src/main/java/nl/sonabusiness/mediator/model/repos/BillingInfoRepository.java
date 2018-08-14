package nl.sonabusiness.mediator.model.repos;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Component;

import nl.sonabusiness.mediator.model.BillingCdr;

@Component
@RepositoryRestResource
public interface BillingInfoRepository extends CrudRepository<BillingCdr, Long> {
	
	@Query("select u from BillingCdr u where u.notified = 0")
	List<BillingCdr> findAllPending();
	
}