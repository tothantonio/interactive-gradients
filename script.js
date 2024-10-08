document.addEventListener('DOMContentLoaded', () => {
    const interBubble = document.querySelector('.interactive');
    
    if (!interBubble) {
        console.error('Element with class "interactive" not found.');
        return;
    }

    let curX = 0;
    let curY = 0;
    let tgX = 0;
    let tgY = 0;

    const move = () => {
        curX += (tgX - curX) / 20;
        curY += (tgY - curY) / 20;
        interBubble.style.transform = `translate(${Math.round(curX)}px, ${Math.round(curY)}px)`;
        requestAnimationFrame(move);
    };

    window.addEventListener('mousemove', (event) => {
        tgX = event.clientX;
        tgY = event.clientY;
    });

    move();

    const padlock = document.getElementById('padlock');
    const bar = document.getElementById('bar');
    const combinationInputTemplate = document.querySelector('.combination-input-template');
    const combinationInputContainer = document.getElementById('combination-input-container');
    const unlockButton = document.getElementById('unlock-button');
    const responseText = document.getElementById('response-text');

    const inputWidth = 60;
    let comboArray = [6, 3, 7, 5];

    let lockRestingColor;

    TweenMax.set('#padlock', { transformOrigin: '50% 50%' });

    const searchParams = {};
    window.location.search.replace('?', '').split('&').forEach((x) => {
        const a = x.split('=');
        searchParams[a[0]] = a[1];
    });
    if (searchParams['h']) {
        let number = parseInt(searchParams['h'], 16);
        if (!isNaN(number)) {
            comboArray = (number + '').split('').map((x) => parseInt(x, 10));
        }
    }

    for (let i = 0; i < comboArray.length; i++) {
        const clone = combinationInputTemplate.cloneNode(true);

        const x = i * inputWidth - (comboArray.length - 1) * inputWidth / 2;
        clone.setAttribute('transform', `translate(${x},0)`);
        clone.setAttribute('class', 'combination-input');

        combinationInputContainer.appendChild(clone);
    }

    unlockButton.onclick = () => {
        if (checkCombination()) {
            startUnlockAttempt(() => {
                const tl = new TimelineMax({ onComplete: finishUnlockAttempt });
                lockRestingColor = 'hsl(120,50%,100%)';
                responseText.innerHTML = 'correct';

                tl.to('#box', 0, { fill: lockRestingColor });
                tl.to('#bar', 0, { stroke: lockRestingColor });
                tl.to('#bar', 0.3, { y: -20, ease: Back.easeOut.config(4) }, 'b');
                tl.to('#padlock', 0.3, { scale: 1.2, ease: Back.easeOut.config(4) }, 'b');
                tl.to('#box', 0.3, { fill: 'hsl(120,50%,60%)' }, 'b');
                tl.to('#bar', 0.3, { stroke: 'hsl(120,50%,60%)' }, 'b');
            });
        } else {
            startUnlockAttempt(() => {
                const tl = new TimelineMax({ onComplete: finishUnlockAttempt });
                lockRestingColor = 'hsl(0,50%,100%)';
                responseText.innerHTML = 'incorrect';

                tl.to('#box', 0, { fill: lockRestingColor });
                tl.to('#bar', 0, { stroke: lockRestingColor });
                tl.to('#bar', 0.1, { y: 0, ease: Power0.easeNone }, 'b');
                tl.to('#padlock', 0.1, { scale: 1, ease: Power0.easeNone }, 'b');
                tl.to('#box', 0.1, { fill: 'hsl(0,50%,60%)' }, 'b');
                tl.to('#bar', 0.1, { stroke: 'hsl(0,50%,60%)' }, 'b');
                tl.to('#padlock', 0.1, { x: 260 });
                tl.to('#padlock', 0.1, { x: 240 });
                tl.to('#padlock', 0.1, { x: 260 });
                tl.to('#padlock', 0.1, { x: 250 });
            });
        }
    }

    const startUnlockAttempt = (onComplete) => {
        const tl = new TimelineMax({ onComplete });

        tl.to('#unlock-button', 0.5, { y: 550, opacity: 0, ease: Power2.easeInOut }, 'a');
        tl.staggerTo('.combination-input', 0.5, { y: 200, opacity: 0, ease: Power2.easeInOut }, 0.1, 'a+=0.25');
        tl.to('#padlock', 0.5, { y: 250, ease: Power2.easeInOut });

        tl.to('#padlock', 1, { scale: 0.9 }, 'build');
        tl.to('#bar', 1, { y: 10 }, 'build');
    }

    const finishUnlockAttempt = () => {
        const tl = new TimelineMax();

        tl.to('#response-text', 0.5, { y: 30, opacity: 1 });
        tl.to('#response-text', 2, {});
        tl.to('#response-text', 0.5, { y: 0, opacity: 0 });
        tl.to('#box', 0.25, { fill: lockRestingColor, ease: Power2.easeInOut }, 'a');
        tl.to('#bar', 0.25, { stroke: lockRestingColor, y: 0, ease: Power2.easeInOut }, 'a');
        tl.to('#padlock', 0.25, { scale: 1, y: 220 }, 'a');
        tl.to('#unlock-button', 0.5, { y: 450, opacity: 1 }, 'b');
        tl.staggerTo('.combination-input', 0.5, { y: 0, opacity: 1 }, 0.1, 'b+=0.25')
    }

    const delegateFunction = (e) => {
        if (e.target.matches('.up-button')) {
            const text = e.target.parentElement.querySelector('.text-value');
            text.innerHTML = rollOver(parseInt(text.innerHTML) + 1);
        } else if (e.target.matches('.down-button')) {
            const text = e.target.parentElement.querySelector('.text-value');
            text.innerHTML = rollOver(parseInt(text.innerHTML) - 1);
        }
    }

    const rollOver = (val) => {
        if (val > 9) {
            return val % 10;
        }
        if (val < 0) {
            return val + 10;
        }
        return val;
    }

    const checkCombination = () => {
        const inputs = document.querySelectorAll('.combination-input .text-value');
        let valid = true;

        for (let i = 0; i < inputs.length; i++) {
            if (parseInt(inputs[i].innerHTML) !== comboArray[i]) {
                valid = false;
            }
        }

        return valid;
    }

    document.onmouseup = delegateFunction;
    document.ontouchend = delegateFunction;
});