const ETHER = 10 ** 16
const NUM_SHIPS = 5
const ENTRY_FEE = 1
const WAITING_FOR_PLAYER2 = 0;
const GAME_STARTED = 1;
const MAX_PLAYERS_REACHED = 2;

App = {
    contracts: {},

    load: async () => {
        await App.loadWeb3()
        await App.loadAccount()
        await App.loadContract()
        await App.createTable("table1", "Primary Grid", "#7ACEF4")
        await App.createTable("table2", "Target Grid", "white")
        // $('#msg_row').hide()
    },

    // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
    loadWeb3: async () => {
        if (typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider
            web3 = new Web3(web3.currentProvider)
        } else {
            window.alert("Please connect to Metamask.")
        }
        // Modern dapp browsers...
        if (window.ethereum) {
            window.web3 = new Web3(ethereum)
            try {
                // Request account access if needed
                await ethereum.enable()
                // Acccounts now exposed
                web3.eth.sendTransaction({/* ... */})
            } catch (error) {
                // User denied account access...
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = web3.currentProvider
            window.web3 = new Web3(web3.currentProvider)
            // Acccounts always exposed
            web3.eth.sendTransaction({/* ... */})
        }
        // Non-dapp browsers...
        else {
            console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }
    },

    loadAccount: async () => {
        // Set the current blockchain account
        App.account = web3.eth.accounts[0]
    },

    loadContract: async() => {
        // create a JavaScript version of the smart contract
        const battleship = await $.getJSON('Battleship.json')
        App.contracts.Battleship = TruffleContract(battleship)
        App.contracts.Battleship.setProvider(App.web3Provider)

        // create a JavaScript version of the smart contract
        const helper = await $.getJSON('Helper.json')
        App.contracts.Helper = TruffleContract(helper)
        App.contracts.Helper.setProvider(App.web3Provider)

        // Hydrate the smart contract with values from the blockchain
        App.battleship = await App.contracts.Battleship.deployed()
        App.helper = await App.contracts.Helper.deployed()
    },

    cell_clicked: async(cell) => {
        let r = cell.dataset['row']
        let c = cell.dataset['column']
        (await App.battleship.players_move(r, c)).logs[0].args;
    },

    createTable: async(table_id, caption, cell_color) => {
        let columns = 11, rows = 11
        let table = $('#' + table_id);

        let captn = $('<caption>')
        let caption_id = table_id + "_caption"
        captn.attr('id', caption_id);
        captn.html(caption)
        table.append(captn)

        let row = $('<tr>')
        table.append(row)
        let cell = $('<td>')
        let cell_id = table_id + "_0_0"
        cell.attr('id', cell_id)
            .attr('data-row', 0)
            .attr('data-column', 0)
            .attr('bgColor', "black")
        row.append(cell)
        for (let j = 1; j < columns; j++) {
            cell = $('<td>')
            cell_id = table_id + "_0_" + j
            cell.attr('id', cell_id)
                .attr('data-row', 0)
                .attr('data-column', j)
                .attr('bgColor', "white")
                .html(j)
            row.append(cell);
        }

        for (let i = 1; i < rows; i++) {
            row = $('<tr>');
            table.append(row)
            for (var j = 0; j < columns; j++) {
                cell = $('<td>')
                cell_id = table_id + "_" + i + "_" + j
                cell.attr('id', cell_id)
                    .attr('data-row', i)
                    .attr('data-column', j)
                    .attr('bgColor', cell_color)
                    .on('click', function () {
                    App.cell_clicked(this)
                })
                if (j == 0) {
                        cell.html(String.fromCharCode(65 + i -1))
                            .attr('bgColor', "white")
                    }
                row.append(cell);
            }
        }
    },

    drawShips: async(coords) => {
        let sx = Number(coords[0].value.charCodeAt(0) - 65 + 1)
        let sy = Number(coords[1].value)
        let ex = Number(coords[2].value.charCodeAt(0) - 65 + 1)
        let ey = Number(coords[3].value)
        if (sx == ex) {
            for (let i = sy; i <= ey; ++i) {
                let cell = $('#table1_' + sx + '_' + i);
                cell.attr('bgColor', "grey");
            }
        } else if (sy == ey){
            for (let i = sx; i <= ex; ++i) {
                let cell = $('#table1_' + i + '_' + sy);
                cell.attr('bgColor', "grey");
            }
        }
    },

    startGame: async() => {
        let game_started = (await App.battleship.start_game()).logs[0].args;
        console.log(game_started)
        let start = game_started.starts;
        let status = game_started.status.c[0]
        
        console.log(status)
        if (status == WAITING_FOR_PLAYER2) {
            $('#msg_box').html("Waiting for the other player to Start Game!")
            $('#msg_row').fadeIn().delay(5000).queue(function() {
                $(this).fadeOut()
                $(this).dequeue()
            })
            return;
        }
        if (status == GAME_STARTED) {
            $('#start_game_btn').remove()
            if (start) {
                $('#msg_box').html("It's you turn! You have 30 seconds to make your move")
                $('#msg_row').fadeIn().delay(5000).queue(function() {
                    $(this).fadeOut()
                    $(this).dequeue()
                })
                return;
            }
        }
    },

    placeShips: async() => {
        let pos_commits = []
        let form = $('#battleship_form')[0]
        let form_elements = form.elements
        let nonce = form_elements['nonce'].value
        for (let i = 1; i <= NUM_SHIPS; ++i) {
            let coords = form_elements['s' + i + '_coord[]'];
            let _commit = await App.helper.generate_commitment(Number(coords[0].value), coords[1].value, Number(coords[2].value), coords[3].value, nonce)
            pos_commits.push(_commit)
        }
        let ships_placed = (await App.battleship.place_ships(pos_commits[0], pos_commits[1], 
                                                             pos_commits[2], pos_commits[3], 
                                                             pos_commits[4], {
            value: ENTRY_FEE * ETHER,
            gas: 6721975
        })).logs[0].args;

        if(ships_placed.status == false) {
            console.log("Something went wrong!!")
            return;
        }
        for (let i = 1; i <= NUM_SHIPS; ++i) {
            let coords = form_elements['s' + i + '_coord[]'];
            let x = (await App.drawShips(coords))
        }

        $('#battleship_form').remove()

        let common_btn_div = $('#common_btn');
        let cntr = $('<center>')
        let btn = $('<button>')
        btn.attr('id', "start_game_btn")
            .attr('type', "button")
            .attr('class', "btn btn-lg btn-success")
            .on('click', App.startGame)
            .html("Start Game!")
        cntr.append(btn)
        common_btn_div.append(cntr)
    }
}

$(() => {
    $(window).load(() => {
        App.load()
    })
})