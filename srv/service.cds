using {OrderManagement as order} from '../db/vehicle';
service OrderService{
    // function fetchLocation(country   : String,
    //                         state     : String) returns String;
    entity Vehicle as projection on order.Vehicle;
    entity vehicleView as select from Vehicle
    {
     ID
    } 

    entity Order as projection on order.Order;
    entity Customer as projection on order.Customer;
    entity Dealer as projection on order.Dealer;
    entity Model as projection on order.Model;
    entity State as projection on order.State;
    entity stateView as select from State{
     ID, state
    } 
  //  where state like 'K%';
    
}
