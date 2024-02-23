function allocateContainers(containers, perPallet) {
    let groups = []; // 存储每组的板数
    let containerSplits = {}; // 记录每个容器的拆分次数

    // 初始化容器拆分次数
    Object.keys(containers).forEach(container => {
        containerSplits[container] = 0;
    });

    // 尝试为每个容器分配板数
    Object.entries(containers).forEach(([container, boards]) => {
        while (boards > 0) {
            let allocated = false;

            // 优先填充未满的组
            for (let group of groups) {
                let spaceLeft = perPallet - group.total;
                if (spaceLeft > 0 && containerSplits[container] < 3) {
                    let boardsToAdd = Math.min(boards, spaceLeft);
                    group.total += boardsToAdd;
                    group.details.push({ container, boards: boardsToAdd });
                    boards -= boardsToAdd;
                    allocated = true;
                    containerSplits[container] += boardsToAdd > 0 ? 1 : 0;
                    break;
                }
            }

            // 如果当前容器未能分配到任何现有组，创建新的组
            if (!allocated) {
                let boardsToAdd = Math.min(boards, perPallet);
                groups.push({ total: boardsToAdd, details: [{ container, boards: boardsToAdd }] });
                boards -= boardsToAdd;
                containerSplits[container] += boardsToAdd > 0 ? 1 : 0;
            }
        }
    });

    return groups;
}


function calculateBoards(perPallet) {
    // 获取用户输入并转换为所需格式
    const containerNumbers = document.getElementById('containerNumbers').value.trim().split('\n');
    const boardNumbers = document.getElementById('boardNumbers').value.trim().split('\n');

    console.log(`containerNumbers: ${containerNumbers}`);
    console.log(`boardNumbers: ${boardNumbers}`);


    let containers = {};
    containerNumbers.forEach((container, index) => {
        containers[container] = parseInt(boardNumbers[index], 10);
    });


    console.log(containers);
    // 调用算法函数
    let groups = allocateContainers(containers, perPallet);

    // 展示结果到页面
    displayResults(groups);
}

function displayResults(groups) {
    const resultsElement = document.getElementById('results');
    if (groups.length === 0) {
        resultsElement.innerHTML = `<p>没有足够的板数来形成任何组。</p>`;
        return;
    }

    // 创建结果的HTML内容
    let htmlContent = `<p>总共有 ${groups.length} 组，按照要求分配如下：</p>`;
    groups.forEach((group, index) => {
        htmlContent += `<div><strong>组 ${index + 1} (总计 ${group.total} 板):</strong><ul>`;
        group.details.forEach(detail => {
            htmlContent += `<li>柜号 ${detail.container}：${detail.boards} 板</li>`;
        });
        htmlContent += `</ul></div>`;
    });

    resultsElement.innerHTML = htmlContent;
}

