package nl.sonabusiness.mediator.model.repos;

import java.util.List;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import nl.sonabusiness.mediator.model.Cdr;

@Component
@RepositoryRestResource
public interface CdrRepository extends PagingAndSortingRepository<Cdr, Long> {
	
	@Query("select u from Cdr u where u.seq_id = ?1 and u.ratop = ?2 and DATEDIFF(?3, u.date) <= 150")
	List<Cdr> findCdr(String seqid, String ratop, String pdate);

	@Transactional
	@Modifying
	@Query("delete from Cdr u where DATEDIFF(NOW(), u.date) > 150")
	void deleteCdrsOlderThan150Days();
}
