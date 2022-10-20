module hello_move::bayou {

    use std::vector;

    use aptos_framework::aptos_account;
    use aptos_framework::aptos_coin::{AptosCoin};
    use aptos_framework::coin;
    use aptos_std::type_info;

    const EMISMATCH: u64 = 10;
    const EINVALID_AMOUNT: u64 = 11;

    public entry fun batch_transfer<CoinType>(sender: &signer, recipients: vector<address>, amounts: vector<u64>) {
        let num_recipients = vector::length(&recipients);
        let num_amounts = vector::length(&amounts);
        assert!(num_recipients == num_amounts, EMISMATCH);

        let type_name = type_info::type_name<CoinType>();
        let apt_type_name = type_info::type_name<AptosCoin>();
        let is_aptos_coin = type_name == apt_type_name;

        let counter = 0;
        while (counter < num_recipients) {
            let amount = vector::borrow(&amounts, counter); 
            assert!(*amount > 0, EINVALID_AMOUNT);

            let recipient = vector::borrow(&recipients, counter);
            if (is_aptos_coin) {
                aptos_account::transfer(sender, *recipient, *amount);
            } else {
                coin::transfer<CoinType>(sender, *recipient, *amount);
            };
            counter = counter + 1;
        }
    }

    #[test_only]
    use std::signer;
    #[test_only]
    use std::unit_test;
    #[test_only]
    use aptos_framework::account;
    #[test_only]
    use aptos_framework::aggregator_factory;
    #[test_only]
    use aptos_framework::aptos_coin;
    #[test_only]
    use aptos_std::from_bcs;

    #[test_only]
    const EINVALID_BALANCE: u64 = 100;

    #[test_only]
    struct Fake {}

    #[test_only]
    fun prepare_fake(framework: signer, mod: signer, sender: &signer) {
        use aptos_framework::managed_coin;

        aggregator_factory::initialize_aggregator_factory_for_test(&framework);
        managed_coin::initialize<Fake>(&mod, b"Fake", b"FAKE", 8, true);

        let sender_addr = signer::address_of(sender);
        account::create_account_for_test(sender_addr);
        managed_coin::register<Fake>(sender);
        managed_coin::mint<Fake>(
            &mod,
            signer::address_of(sender),
            100000000
        );
        assert!(coin::balance<Fake>(sender_addr) == 100000000, EINVALID_BALANCE); 
    }

    #[test_only]
    fun prepare_apt(framework: signer, sender: &signer) {
        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(&framework);
        let sender_addr = signer::address_of(sender); 
        account::create_account_for_test(sender_addr);
        coin::register<AptosCoin>(sender);
        coin::deposit(sender_addr, coin::mint(100000000, &mint_cap));
        assert!(coin::balance<AptosCoin>(sender_addr) == 100000000, EINVALID_BALANCE); 

        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
    }

    #[test(framework = @aptos_framework, sender = @token_sender)]
    public fun test_transfer_apt(framework: signer, sender: signer) {
        prepare_apt(framework, &sender);
        let sender_addr = signer::address_of(&sender);

        let recipients = vector::empty();
        let bob = from_bcs::to_address(x"0000000000000000000000000000000000000000000000000000000000000b0b");
        let signer_bob = account::create_account_for_test(bob);
        coin::register<AptosCoin>(&signer_bob);

        let carol = from_bcs::to_address(x"00000000000000000000000000000000000000000000000000000000000ca501");
        let signer_carol = account::create_account_for_test(carol);
        coin::register<AptosCoin>(&signer_carol);

        vector::push_back(&mut recipients, bob);
        vector::push_back(&mut recipients, carol);

        let amounts = vector::empty();
        vector::push_back(&mut amounts, 10000000);
        vector::push_back(&mut amounts, 20000000);

        batch_transfer<AptosCoin>(&sender, recipients, amounts);

        assert!(coin::balance<AptosCoin>(sender_addr) == 70000000, EINVALID_BALANCE);
        assert!(coin::balance<AptosCoin>(bob) == 10000000, EINVALID_BALANCE);
        assert!(coin::balance<AptosCoin>(carol) == 20000000, EINVALID_BALANCE);
    }

    #[test(framework = @aptos_framework, sender = @token_sender)]
    public fun test_transfer_apt_to_new_accounts(framework: signer, sender: signer) {
        prepare_apt(framework, &sender);
        let sender_addr = signer::address_of(&sender);

        let recipients = vector::empty();
        let bob = from_bcs::to_address(x"0000000000000000000000000000000000000000000000000000000000000b0b");
        let carol = from_bcs::to_address(x"00000000000000000000000000000000000000000000000000000000000ca501");
        vector::push_back(&mut recipients, bob);
        vector::push_back(&mut recipients, carol);

        let amounts = vector::empty();
        vector::push_back(&mut amounts, 10000000);
        vector::push_back(&mut amounts, 20000000);

        batch_transfer<AptosCoin>(&sender, recipients, amounts);

        assert!(coin::balance<AptosCoin>(sender_addr) == 70000000, EINVALID_BALANCE);
        assert!(coin::balance<AptosCoin>(bob) == 10000000, EINVALID_BALANCE);
        assert!(coin::balance<AptosCoin>(carol) == 20000000, EINVALID_BALANCE);
    }

    #[test(framework = @aptos_framework, mod = @hello_move, sender = @token_sender)]
    public fun test_transfer_fake(framework: signer, mod: signer, sender: signer) {
        prepare_fake(framework, mod, &sender);
        let sender_addr = signer::address_of(&sender);

        let recipients = vector::empty();
        let bob = from_bcs::to_address(x"0000000000000000000000000000000000000000000000000000000000000b0b");
        let signer_bob = account::create_account_for_test(bob);
        coin::register<Fake>(&signer_bob);

        let carol = from_bcs::to_address(x"00000000000000000000000000000000000000000000000000000000000ca501");
        let signer_carol = account::create_account_for_test(carol);
        coin::register<Fake>(&signer_carol);

        vector::push_back(&mut recipients, bob);
        vector::push_back(&mut recipients, carol);

        let amounts = vector::empty();
        vector::push_back(&mut amounts, 10000000);
        vector::push_back(&mut amounts, 20000000);

        batch_transfer<Fake>(&sender, recipients, amounts);

        assert!(coin::balance<Fake>(sender_addr) == 70000000, EINVALID_BALANCE);
        assert!(coin::balance<Fake>(bob) == 10000000, EINVALID_BALANCE);
        assert!(coin::balance<Fake>(carol) == 20000000, EINVALID_BALANCE);
    }

    #[test(framework = @aptos_framework, mod = @hello_move, sender = @token_sender)]
    #[expected_failure(abort_code = 393221)]
    public fun test_transfer_fake_to_new_accounts(framework: signer, mod: signer, sender: signer) {
        prepare_fake(framework, mod, &sender);

        let num: u64 = 3;
        let signers = unit_test::create_signers_for_testing(num);

        let recipients = vector::empty();
        let amounts = vector::empty();

        let counter: u64 = 0;
        while (counter < num) {
            let recipient = vector::borrow(&signers, counter);
            let addr = signer::address_of(recipient);

            vector::push_back(&mut recipients, addr);
            vector::push_back(&mut amounts, (counter + 1) * 10000000);

            counter = counter + 1;
        }; 

        batch_transfer<Fake>(&sender, recipients, amounts);
    }

    #[test(framework = @aptos_framework, mod = @hello_move, sender = @token_sender)]
    #[expected_failure(abort_code = 10)]
    public fun test_transfer_mismatch(framework: signer, mod: signer, sender: signer) {
        prepare_fake(framework, mod, &sender);

        let recipients = vector::empty();
        let bob = from_bcs::to_address(x"0000000000000000000000000000000000000000000000000000000000000b0b");
        let signer_bob = account::create_account_for_test(bob);
        coin::register<Fake>(&signer_bob);

        vector::push_back(&mut recipients, bob);

        let amounts = vector::empty();
        vector::push_back(&mut amounts, 10000000);
        vector::push_back(&mut amounts, 20000000);

        batch_transfer<Fake>(&sender, recipients, amounts);
    }

    #[test(framework = @aptos_framework, sender = @token_sender)]
    #[expected_failure(abort_code = 11)]
    public fun test_transfer_zero_amount(framework: signer, sender: signer) {
        prepare_apt(framework, &sender);

        let recipients = vector::empty();
        let bob = from_bcs::to_address(x"0000000000000000000000000000000000000000000000000000000000000b0b");
        let carol = from_bcs::to_address(x"00000000000000000000000000000000000000000000000000000000000ca501");
        vector::push_back(&mut recipients, bob);
        vector::push_back(&mut recipients, carol);

        let amounts = vector::empty();
        vector::push_back(&mut amounts, 0);
        vector::push_back(&mut amounts, 20000000);

        batch_transfer<AptosCoin>(&sender, recipients, amounts);
    }

    #[test(framework = @aptos_framework, sender = @token_sender)]
    #[expected_failure(abort_code = 65542)]
    public fun test_transfer_insufficient_balance(framework: signer, sender: signer) {
        prepare_apt(framework, &sender);

        let recipients = vector::empty();
        let bob = from_bcs::to_address(x"0000000000000000000000000000000000000000000000000000000000000b0b");
        let carol = from_bcs::to_address(x"00000000000000000000000000000000000000000000000000000000000ca501");
        vector::push_back(&mut recipients, bob);
        vector::push_back(&mut recipients, carol);

        let amounts = vector::empty();
        vector::push_back(&mut amounts, 100000);
        vector::push_back(&mut amounts, 20000000000);

        batch_transfer<AptosCoin>(&sender, recipients, amounts);
    }

    #[test(framework = @aptos_framework, sender = @token_sender)]
    public fun test_transfer_to_sender(framework: signer, sender: signer) {
        prepare_apt(framework, &sender);
        let sender_addr = signer::address_of(&sender);

        let recipients = vector::empty();
        let carol = from_bcs::to_address(x"00000000000000000000000000000000000000000000000000000000000ca501");
        vector::push_back(&mut recipients, sender_addr);
        vector::push_back(&mut recipients, carol);

        let amounts = vector::empty();
        vector::push_back(&mut amounts, 100000);
        vector::push_back(&mut amounts, 200000);

        batch_transfer<AptosCoin>(&sender, recipients, amounts);
    }
}