#[starknet::contract]
mod MyNFT {
    use openzeppelin::introspection::src5::SRC5Component;
    use openzeppelin::token::erc721::{ERC721Component, ERC721HooksEmptyImpl};
    use starknet::ContractAddress;

    component!(path: ERC721Component, storage: erc721, event: ERC721Event);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);

    // ERC721 Mixin
    #[abi(embed_v0)]
    impl ERC721MixinImpl = ERC721Component::ERC721MixinImpl<ContractState>;
    impl ERC721InternalImpl = ERC721Component::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        erc721: ERC721Component::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        ERC721Event: ERC721Component::Event,
        #[flat]
        SRC5Event: SRC5Component::Event
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        recipient: ContractAddress
    ) {
        let name = "MyNFT";
        let symbol = "NFT";
        let base_uri = "https://ipfs.io/ipfs/bafybeigc4h4vjhkwxvceykd627nyxyieu3j34msxbo3bsxv56f3w25zppa/";
        let token_id = 1;

        self.erc721.initializer(name, symbol, base_uri);
        self.erc721.mint(recipient, token_id);
    }
}