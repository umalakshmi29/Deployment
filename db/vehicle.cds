namespace OrderManagement;
// using {managed} from '@sap/cds/common';

entity Vehicle{
    key ID: String;
    oldPrice: Decimal(15,2);
    Price: Decimal(15,2);
    dealer:Association to Dealer;
    model: Association to Model;
    state: Association to State;
}


entity Model{
    key ID:UUID;
    brand: String;
    model: Integer;
    modelName: String;
    vehicle: Composition of many Vehicle on vehicle.model=$self;
}
entity Dealer{
    key ID:UUID;
    dealerName: String;
    address: String;
    phoneNumber: String;
    country: String;
    state:String;
    latitude: Double;
    longitude:Double;
    vehicle: Association to Vehicle on vehicle.dealer=$self;
}

entity State{
    key ID:UUID;
    state: String;
    tax: Decimal;
    vehicles: Association to many Vehicle on vehicles.state = $self;
}

entity Order{
    key ID:UUID;
    quantity: Integer;
    status: String default 'Pending';
    customer:Association to Customer;
    vehicle:Association to Order;
}

entity Customer{
    key ID:UUID;
    customerName: String;
    phoneNumber: String;
    order:Composition of many Order on order.customer=$self;
}

