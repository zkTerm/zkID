#[starknet::interface]
trait IZkIDProofRegistry<TContractState> {
    fn store_proof(
        ref self: TContractState,
        proof_id: felt252,
        proof_hash: felt252,
        zk_id: felt252
    );
    fn get_proof(self: @TContractState, proof_id: felt252) -> (felt252, felt252, u64, starknet::ContractAddress);
    fn verify_proof_exists(self: @TContractState, proof_id: felt252) -> bool;
}

#[starknet::contract]
mod ZkIDProofRegistry {
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};
    use starknet::storage::{Map, StorageMapReadAccess, StorageMapWriteAccess};

    #[storage]
    struct Storage {
        proof_hashes: Map<felt252, felt252>,
        proof_owners: Map<felt252, ContractAddress>,
        proof_timestamps: Map<felt252, u64>,
        proof_zkids: Map<felt252, felt252>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        ProofStored: ProofStored,
    }

    #[derive(Drop, starknet::Event)]
    struct ProofStored {
        #[key]
        proof_id: felt252,
        proof_hash: felt252,
        zk_id: felt252,
        owner: ContractAddress,
        timestamp: u64,
    }

    #[abi(embed_v0)]
    impl ZkIDProofRegistryImpl of super::IZkIDProofRegistry<ContractState> {
        fn store_proof(
            ref self: ContractState,
            proof_id: felt252,
            proof_hash: felt252,
            zk_id: felt252
        ) {
            let caller = get_caller_address();
            let timestamp = get_block_timestamp();
            
            assert(proof_hash != 0, 'Invalid proof hash');
            assert(zk_id != 0, 'Invalid zkID');
            
            let existing_hash = self.proof_hashes.read(proof_id);
            assert(existing_hash == 0, 'Proof already exists');
            
            self.proof_hashes.write(proof_id, proof_hash);
            self.proof_owners.write(proof_id, caller);
            self.proof_timestamps.write(proof_id, timestamp);
            self.proof_zkids.write(proof_id, zk_id);
            
            self.emit(ProofStored {
                proof_id,
                proof_hash,
                zk_id,
                owner: caller,
                timestamp,
            });
        }

        fn get_proof(
            self: @ContractState,
            proof_id: felt252
        ) -> (felt252, felt252, u64, ContractAddress) {
            let hash = self.proof_hashes.read(proof_id);
            let zkid = self.proof_zkids.read(proof_id);
            let timestamp = self.proof_timestamps.read(proof_id);
            let owner = self.proof_owners.read(proof_id);
            
            (hash, zkid, timestamp, owner)
        }

        fn verify_proof_exists(self: @ContractState, proof_id: felt252) -> bool {
            let hash = self.proof_hashes.read(proof_id);
            hash != 0
        }
    }
}
