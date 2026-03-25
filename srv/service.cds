using {sap.capire.incidents as my} from '../db/schema';


service ProcessorService {
    annotate ProcessorService.Incidents with @odata.draft.enabled; 
    annotate ProcessorService with @(requires: 'support');

    entity Incidents as projection on my.Incidents;

    @readonly
    entity Customers as projection on my.Customers;
}



service AdminService {
    annotate AdminService with @(requires: 'admin');
    entity Customers as projection on my.Customers;
    entity Incidents as projection on my.Incidents;
}
