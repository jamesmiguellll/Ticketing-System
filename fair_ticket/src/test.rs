#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};
use soroban_sdk::token::{Client as TokenClient, StellarAssetClient as TokenAdminClient};

fn setup_token(env: &Env) -> (Address, TokenClient, TokenAdminClient) {
    let admin = Address::generate(env);
    let token_contract = env.register_stellar_asset_contract(admin.clone());
    let token_client = TokenClient::new(env, &token_contract);
    let token_admin = TokenAdminClient::new(env, &token_contract);
    (token_contract, token_client, token_admin)
}

#[test]
fn test_1_happy_path_buy_ticket() {
    let env = Env::default();
    env.mock_all_auths();
    
    let admin = Address::generate(&env);
    let contract_id = env.register_contract(None, FairTicketContract);
    let client = FairTicketContractClient::new(&env, &contract_id);
    
    client.init(&admin);
    
    let (token_id, token_client, token_admin) = setup_token(&env);
    
    let seller = Address::generate(&env);
    let buyer = Address::generate(&env);
    
    // Mint some payment tokens to the buyer so they can buy the ticket
    token_admin.mint(&buyer, &1000);
    
    // Admin mints a ticket to the seller
    let ticket_id = client.mint(&seller, &100, &token_id);
    
    // Seller lists the ticket for sale
    client.list_ticket(&ticket_id);
    
    // Buyer buys the ticket
    client.buy_ticket(&ticket_id, &buyer);
    
    // Verify buyer has paid seller 100
    assert_eq!(token_client.balance(&seller), 100);
    assert_eq!(token_client.balance(&buyer), 900);
    
    // Verify new owner is buyer
    let ticket = client.get_ticket(&ticket_id);
    assert_eq!(ticket.owner, buyer);
    assert_eq!(ticket.is_for_sale, false);
}

#[test]
#[should_panic(expected = "Ticket is not for sale")]
fn test_2_edge_case_not_for_sale() {
    let env = Env::default();
    env.mock_all_auths();
    
    let admin = Address::generate(&env);
    let contract_id = env.register_contract(None, FairTicketContract);
    let client = FairTicketContractClient::new(&env, &contract_id);
    
    client.init(&admin);
    
    let (token_id, _, token_admin) = setup_token(&env);
    let seller = Address::generate(&env);
    let buyer = Address::generate(&env);
    token_admin.mint(&buyer, &1000);
    
    let ticket_id = client.mint(&seller, &100, &token_id);
    
    // Seller does NOT list the ticket for sale
    // Buyer tries to buy the ticket
    client.buy_ticket(&ticket_id, &buyer);
}

#[test]
fn test_3_state_verification_after_mint() {
    let env = Env::default();
    env.mock_all_auths();
    
    let admin = Address::generate(&env);
    let contract_id = env.register_contract(None, FairTicketContract);
    let client = FairTicketContractClient::new(&env, &contract_id);
    client.init(&admin);
    
    let token_id = Address::generate(&env);
    let user = Address::generate(&env);
    
    let ticket_id = client.mint(&user, &50, &token_id);
    let ticket = client.get_ticket(&ticket_id);
    
    assert_eq!(ticket.id, 1);
    assert_eq!(ticket.owner, user);
    assert_eq!(ticket.face_value, 50);
    assert_eq!(ticket.payment_token, token_id);
    assert_eq!(ticket.is_for_sale, false);
}

#[test]
fn test_4_list_ticket() {
    let env = Env::default();
    env.mock_all_auths();
    
    let admin = Address::generate(&env);
    let contract_id = env.register_contract(None, FairTicketContract);
    let client = FairTicketContractClient::new(&env, &contract_id);
    client.init(&admin);
    
    let token_id = Address::generate(&env);
    let seller = Address::generate(&env);
    
    let ticket_id = client.mint(&seller, &50, &token_id);
    client.list_ticket(&ticket_id);
    
    let ticket = client.get_ticket(&ticket_id);
    assert_eq!(ticket.is_for_sale, true);
}

#[test]
#[should_panic]
fn test_5_edge_case_insufficient_funds() {
    let env = Env::default();
    env.mock_all_auths();
    
    let admin = Address::generate(&env);
    let contract_id = env.register_contract(None, FairTicketContract);
    let client = FairTicketContractClient::new(&env, &contract_id);
    client.init(&admin);
    
    let (token_id, _, _) = setup_token(&env);
    let seller = Address::generate(&env);
    let buyer = Address::generate(&env);
    
    // Notice we do NOT mint any tokens to the buyer here
    let ticket_id = client.mint(&seller, &100, &token_id);
    client.list_ticket(&ticket_id);
    
    // Buyer tries to buy the ticket without enough funds, token transfer should panic
    client.buy_ticket(&ticket_id, &buyer);
}
