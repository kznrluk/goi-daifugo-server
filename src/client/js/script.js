const getSessionId = () => {
    const getParamId = new URLSearchParams(location.href).get('sessionId');
    const localId = localStorage.getItem('sessionId');
    return getParamId || localId || 3;
};

document.addEventListener('DOMContentLoaded', () => {
    $('#isOwnTurn').hide();
    const sessionId = getSessionId();
    console.log({ sessionId });
    const socket = io.connect('http://localhost:3010/session/' + sessionId, { transports: ['websocket'] });

    document.addEventListener('unload', () => {
        socket.emit('disconnect');
    });

    socket.emit('joinSession');
    socket.on('message', d => console.log(d));

    document.getElementById('cardNumber').addEventListener('change', (event) => {
        const { value } = event.currentTarget;
        socket.emit('changeOptions', { cardNumber: value });
    });
    socket.emit('changeOptions', { cardNumber: 3 });

    const sendWordSets = () => {
        const data = $('#cardInput').children().get().map((elm) => elm.value);
        socket.emit('changeOwnWordSets', data);
    }
    document.getElementById('cardInput').addEventListener('input', (event) => {
        sendWordSets();
    });

    document.getElementById('name').addEventListener('input', (event) => {
        const data = event.currentTarget.value;
        socket.emit('changeOwnName', data);
    });

    socket.on('playerList', (data) => {
        const ownData = data.find(d => d.id === socket.id);
        console.log({ownData, socketid: socket.id});
        if (ownData.isMaster) {
            document.getElementById('isMaster').innerText = 'ゲームマスターです。';
            $('#cardNumber').prop('disabled', false);
            $('#start').show().prop('disable', true);
            $('#ready').hide();
        } else {
            $('#start').hide();
            $('#ready').show();
            $('#cardNumber').prop('disabled', true);
        }
        document.getElementById('userList').innerHTML = data.map(({ name, readyForStart }) => {
            return readyForStart ? `<li style="color: #ff2e31">${name}` : `<li>${name}`;
        }).join('');
        console.log(data);
    });

    socket.on('onSessionOptChanged', (options) => {
        console.log(options);
        document.getElementById('cardNumber').selectIndex = options.cardNumber;
        const list = [...Array(Number(options.cardNumber))].map((_, index) => {
            return `<input class="wordInput" name="word${index}" value="${index+1}つ目の語彙">`;
        }).join('');
        document.getElementById('cardInput').innerHTML = list;
        sendWordSets();
    });

    socket.on('onErrorReload', (message) => {
        console.log(message);
        location.reload();
    });

    let isReady = false;
    $('#ready').on('click', (event) => {
        event.preventDefault();
        socket.emit('changeOwnReadyStatus', isReady = !isReady);
        $('#ready').text(isReady ? 'キャンセル' : 'Ready');
    });

    $('#start').on('click', (event) => {
        event.preventDefault();
        socket.emit('startSession', isReady = !isReady);
    });

    const renderCurrentLayout = (layout) => {
        document.getElementById('layout').innerHTML = layout.map(word => {
            const { precedingWord, stagingWord, isStagingWordWin } = word;
            return `<li>${precedingWord.word} VS ${isStagingWordWin ? stagingWord.word : ''} ${isStagingWordWin ? '○' : '✖︎'}</li>`;
        }).join('');
    };

    const renderSelectButtonsFromDOM = () => {
        const words = $('#cardInput').children().get().map((elm) => elm.value);

        const elms = words.map((value, index) => (
            $('<button>').text(value).on('click', () => {
                socket.emit('insertWordByIndex', index);
                console.log(index);
            })
        ));

        elms.push($('<button>').text('SKIP').on('click',() => {
            socket.emit('skipOwnTurn');
        }));

        $('#cardSelect').append(elms);
    }

    socket.on('insertWordByIndex', (data) => {
        document.getElementById('staging').innerHTML = `<p>${data.player.name}のターン<br><h3>${data.word}</h3>`;
    })

    socket.on('startSession', () => {
        $('.wordInput').prop('disabled', true);
        renderSelectButtonsFromDOM();
        console.log('スタート！');
    });
    socket.on('sessionDetail', (detail) => {
        const { currentPlayerId, layout, currentAction } = detail;
        if (currentPlayerId === socket.id) {
            $('#isOwnTurn').show();
            $('#selectApprove').children().prop('disabled', true);
            $('#cardSelect').children().prop('disabled', false);
        } else {
            $('#isOwnTurn').hide();
            $('#cardSelect').children().prop('disabled', true);
            $('#selectApprove').children().prop('disabled', false);
        }

        renderCurrentLayout(layout);
        console.log({ detail });
    });
    socket.on('setFirstWord', () => {
        socket.emit('setWordByInput', window.prompt('最初のカードを設定してください。'));
    });

    $('#selectApprove').on('click', (event) => {
        const isApproved = event.target.id === 'approve';
        console.log(event.target.id);
        socket.emit('setJudgeForStagingWord', isApproved);
    });

    socket.on('setJudgeForStagingWord', (data) => {
        console.log(data);
    });

    socket.on('judgedStagingWord', (data) => {
        console.log(data);
    })
});
