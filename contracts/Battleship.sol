pragma solidity ^0.5.8;

contract Battleship {
    uint8 num_players = 0;
    uint8 constant WAITING_FOR_PLAYER2 = 0;
    uint8 constant GAME_STARTED = 1;
    uint8 constant MAX_PLAYERS_REACHED = 2;
    uint8 constant MAX_PLAYERS = 2;

    constructor() public {}

    struct Player {
        bool starts;
        bytes32 commitment1;
        bytes32 commitment2;
        bytes32 commitment3;
        bytes32 commitment4;
        bytes32 commitment5;
    }

    mapping (uint8 => address) public player_addr;
    mapping (address => uint8) public player_id;
    mapping (address => Player) public players;

    event ShipsPlaced(
        bool status
    );

    /// @param pos_commit1 SHA-3 256 Hash of the coordinates of ship1 and random nonce
    /// @param pos_commit2 SHA-3 256 Hash of the coordinates of ship2 and random nonce
    /// @param pos_commit3 SHA-3 256 Hash of the coordinates of ship3 and random nonce
    /// @param pos_commit4 SHA-3 256 Hash of the coordinates of ship4 and random nonce
    /// @param pos_commit5 SHA-3 256 Hash of the coordinates of ship5 and random nonce
    function place_ships(bytes32 pos_commit1, bytes32 pos_commit2,
                         bytes32 pos_commit3, bytes32 pos_commit4,
                         bytes32 pos_commit5) public payable {
        if (player_id[msg.sender] == 0) {
            if (num_players == 2) {
                emit ShipsPlaced(false);
                return;
            }
        }
        require(msg.value >= 0.01 ether, "Amount too low, Min Bet 0.01 Ether");
        require(msg.value <= 10 ether, "Amount too high, Max Bet 10 Ether");
        players[msg.sender].commitment1 = pos_commit1;
        players[msg.sender].commitment2 = pos_commit2;
        players[msg.sender].commitment3 = pos_commit3;
        players[msg.sender].commitment4 = pos_commit4;
        players[msg.sender].commitment5 = pos_commit5;
        emit ShipsPlaced(true);
    }

    event GameStarted(
        uint8 status,
        bool starts
    );

    function start_game() public {
        if (player_id[msg.sender] == 0) {
            if (num_players == 2) {
                emit GameStarted(MAX_PLAYERS_REACHED, false);
                return;
            }
            num_players = num_players + 1;
            player_id[msg.sender] = num_players;
            player_addr[num_players] = msg.sender;
            if (num_players == 2) {
                players[msg.sender].starts = (uint256(keccak256(abi.encodePacked(now))) % 2) == 1;  // randomly choose the player that starts the game
                players[player_addr[1]].starts = !players[msg.sender].starts;
            }
        }
        if (num_players == 2) {
            emit GameStarted(GAME_STARTED, players[msg.sender].starts);
            return;
        }
        emit GameStarted(WAITING_FOR_PLAYER2, false);
    }

    function players_move(uint r, uint c) public {
        
    } 
}