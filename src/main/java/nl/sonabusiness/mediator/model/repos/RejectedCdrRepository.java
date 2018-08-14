package nl.sonabusiness.mediator.model.repos;

import java.util.List;

import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Component;
import nl.sonabusiness.mediator.model.RejectedCdr;

@Component
@RepositoryRestResource
public interface RejectedCdrRepository extends PagingAndSortingRepository<RejectedCdr, Long> {
	
}
