package nl.sonabusiness.mediator.services;

import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.StoredProcedureQuery;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


@Service
public class MainService {
	
	@Autowired EntityManager entityManager;
	
	public List<Integer> obtainMissingSequences() {
		StoredProcedureQuery query = entityManager.createStoredProcedureQuery("compute_lags");
		query.execute();
		
		List<Integer> list = (List<Integer>) query.getResultList();
		return list;
	}


}
