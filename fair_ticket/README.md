# FairTicket

**Project Name:** FairTicket

**Problem:** Ticket scalping, bot monopolies, and counterfeit tickets make live events frustrating and expensive for real fans.

**Solution:** An event ticketing platform using Soroban smart contracts where the smart contract enforces an absolute price ceiling on secondary market resales. If a fan can't make it, they can only resell the ticket NFT up to its face value, cutting out predatory scalpers entirely.

**Timeline:** 1-2 weeks (Bootcamp timeframe)

**Stellar Features Used:** Soroban smart contracts, Custom payment tokens (USDC representation)

**Vision and Purpose:** To democratize live event access and completely eliminate rent-seeking middlemen in the ticketing ecosystem. By mathematically enforcing price ceilings, FairTicket aligns incentives to ensure fans always get tickets at their real value.

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
