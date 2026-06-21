# FairTicket: Decentralized Event Ticketing System

# deployed smart contract: CBKE2SGQ7755PNUGVDSXBVBT7OKPJJVYZTWJYR3UJWW5YHQO2Z2UA2TV

<img width="1913" height="867" alt="image" src="https://github.com/user-attachments/assets/28fb40c4-4b31-4575-b254-baf2f1f97b5c" />

## Project Description
Ticket scalping, bot monopolies, and counterfeit tickets make live events frustrating and expensive for real fans. FairTicket is an event ticketing platform using Soroban smart contracts where the smart contract enforces an absolute price ceiling on secondary market resales. If a fan can't make it, they can only resell the ticket NFT up to its face value, cutting out predatory scalpers entirely.

## Project Vision
To democratize live event access and completely eliminate rent-seeking middlemen in the ticketing ecosystem. By mathematically enforcing price ceilings, FairTicket aligns incentives to ensure fans always get tickets at their real value.

## Key Features
- **Anti-Scalping Protocol:** Absolute price ceiling enforced on secondary market resales directly via smart contracts.
- **Smart Escrow:** Automated transaction processing ensuring buyer and seller security.
- **Soroban Smart Contracts:** Secure and scalable custom logic handling the ticket lifecycle.
- **USDC Representation:** Custom payment tokens ensure stable, frictionless value transfer.

## Future Scope
- **Mobile-first UI:** Abstract away blockchain complexities with simple QR-code based ticket scanning.
- **Dynamic Pricing Engine:** Organizer-controlled pricing models while maintaining secondary caps.
- **Local Anchor Integration:** Enable direct fiat-to-ticket purchases in local currencies.
- **Event Organizer Dashboard:** Granular analytics and management tools for event hosts.

## Prerequisites
- Rust toolchain
- Stellar CLI (`stellar` or `soroban` CLI)

## How to build
```sh
soroban contract build
```

## How to test
```sh
cargo test
```

## How to deploy to testnet
```sh
soroban contract deploy --wasm target/wasm32-unknown-unknown/release/fair_ticket.wasm --source your_identity --network testnet
```

## Sample CLI Invocation
```sh
# Minting a ticket
soroban contract invoke --id <CONTRACT_ID> --source admin --network testnet -- mint --to <USER_ADDRESS> --face_value 50 --payment_token <TOKEN_ADDRESS>

# Buyer purchasing the listed ticket
soroban contract invoke --id <CONTRACT_ID> --source buyer --network testnet -- buy_ticket --ticket_id 1 --buyer <BUYER_ADDRESS>
```

## License
MIT
