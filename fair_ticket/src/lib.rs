#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Ticket {
    pub id: u32,
    pub owner: Address,
    pub face_value: i128,
    pub payment_token: Address,
    pub is_for_sale: bool,
}

#[contracttype]
pub enum DataKey {
    Admin,
    Ticket(u32),
    TicketCounter,
}

#[contract]
pub struct FairTicketContract;

#[contractimpl]
impl FairTicketContract {
    /// Initialize the contract with the admin address
    pub fn init(env: Env, admin: Address) {
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TicketCounter, &0u32);
    }

    /// Admin mints a ticket to a specific address with a set face value
    pub fn mint(env: Env, to: Address, face_value: i128, payment_token: Address) -> u32 {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        let mut counter: u32 = env.storage().instance().get(&DataKey::TicketCounter).unwrap();
        counter += 1;

        let ticket = Ticket {
            id: counter,
            owner: to.clone(),
            face_value,
            payment_token,
            is_for_sale: false,
        };

        env.storage().persistent().set(&DataKey::Ticket(counter), &ticket);
        env.storage().instance().set(&DataKey::TicketCounter, &counter);

        counter
    }

    /// Owner of the ticket lists it for resale
    pub fn list_ticket(env: Env, ticket_id: u32) {
        let mut ticket: Ticket = env.storage().persistent().get(&DataKey::Ticket(ticket_id)).unwrap();
        ticket.owner.require_auth();
        
        ticket.is_for_sale = true;
        env.storage().persistent().set(&DataKey::Ticket(ticket_id), &ticket);
    }

    /// Buyer purchases the ticket at the exact face value
    pub fn buy_ticket(env: Env, ticket_id: u32, buyer: Address) {
        buyer.require_auth();

        let mut ticket: Ticket = env.storage().persistent().get(&DataKey::Ticket(ticket_id)).unwrap();
        
        if !ticket.is_for_sale {
            panic!("Ticket is not for sale");
        }

        // Initialize the token client to handle the payment
        let token_client = soroban_sdk::token::Client::new(&env, &ticket.payment_token);
        
        // Transfer the face value directly from buyer to the seller (previous owner)
        token_client.transfer(&buyer, &ticket.owner, &ticket.face_value);

        // Update the ownership and unlist the ticket
        ticket.owner = buyer;
        ticket.is_for_sale = false;

        env.storage().persistent().set(&DataKey::Ticket(ticket_id), &ticket);
    }

    /// Helper to get ticket details
    pub fn get_ticket(env: Env, ticket_id: u32) -> Ticket {
        env.storage().persistent().get(&DataKey::Ticket(ticket_id)).unwrap()
    }
}

#[cfg(test)]
mod test;
