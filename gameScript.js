
//深clone方法
//使用递归的方式实现数组、对象的深拷贝
function deepClone (obj) {
    let objClone = Array.isArray(obj) ? [] : {};
    if (obj && typeof obj === "object") {
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                //判断ojb子元素是否为对象，如果是，递归复制
                if (obj[key] && typeof obj[key] === "object") {
                    objClone[key] = deepClone(obj[key]);
                } else {
                    //如果不是，简单复制
                    objClone[key] = obj[key];
                }
            }
        }
    }
    return objClone;
}

    //继续标志
    var CONTINUE_FLAG = true;

    //计时器状态
    var MINEINTER;

    //下落速度
    var DOWNSPEED = 600;

    //每次移动20px
    var STEP = 20;

    var ROW_NUM = 23;//行数
    var COL_NUM = 14;//列数

   var mInter = null; 

    var MODELS = [
        //第一个模型:(L)
        {
            0:{row: 1,col: 0},
            1:{row: 1,col: 1},
            2:{row: 1,col: 2},
            3:{row: 0,col: 2}
        },

        // 第2个模型(凸)
        {
            0: {row: 1,col: 0},
            1: {row: 0,col: 1},
            2: {row: 1,col: 1},
            3: {row: 1,col: 2}
        },
        // 第3个模型(田)
        {
            0: {row: 0,col: 1},
            1: {row: 1,col: 1},
            2: {row: 0,col: 2},
            3: {row: 1,col: 2}
        },
        // 第4个模型(一)
        {
            0: {row: 0,col: 0},
            1: {row: 0,col: 1},
            2: {row: 0,col: 2},
            3: {row: 0,col: 3}
        },
        // 第5个模型(Z)
        {
            0: {row: 0,col: 1},
            1: {row: 0,col: 2},
            2: {row: 1,col: 2},
            3: {row: 1,col: 3}
        }
    ]


    //确定模型的随机数
    var first_flag=1;
    var random = 0;

    //当前使用的模型
    var curModel = {};

    //标记16宫格的位置
    var curGraphX = 0;
    var curGraphY = 0;

    //记录所有元素位置（用于碰撞检测）fixedBlock：被保存的元素
    //K=行_列：V=元素
    var fixedBlock = {};   
    
    var leaderBoard = [];

    //分数
    var MARK = 0;
        
    //入口方法
    function init(){
        
        var sT_button = document.getElementById("start_button");    
  
        sT_button.onclick = function(){  
            //初始化分数
            MARK = 0;
            //初始化界面
            clearBox(); 
            //创建模型，游戏运行
            createModel();
            //键盘监听  
            KeyDown();     
        }
    }

    function createModel(){
        //生成随机数
        if(first_flag==1){
            random = Math.round(Math.random()*(MODELS.length-1));
            first_flag = first_flag+1;
        }
        //var random = Math.round(Math.random()*(MODELS.length-1));
        //console.log(random);
        curGraphX = 0;
        curGraphY = 0;
        curModel = MODELS[random];

        //pre_locationBlocks();

        //判断是否结束
        if(isGameOver()){
            gameOver();
            return;
        }
        
        //生成对应数量的元素
        for(var item in curModel){
            var divEle = document.createElement("div");
            divEle.className = "box";
            document.getElementById("container").appendChild(divEle);
        }
        //定位元素位置
        locationBlocks();

        random = Math.round(Math.random()*(MODELS.length-1));
        pre_curModel = MODELS[random];
        pre_locationBlocks();

        //模型自动下落
        autoDown();
    }

    //根据数据源定位元素(定位并且打印)
    function locationBlocks(){
        //判断当前是否越界
        checkBound();
        //拿到所有的块元素
        var allEle = document.getElementsByClassName("box");
        for(var i=0;i<allEle.length;i++)
        {
            //找到每个元素对应的数据
            var activeModel = allEle[i];
            var blockModel = curModel[i];
            //根据每个元素对应的数据来指定元素的位置
            //16宫格位置
            //元素在元素内的位置
            activeModel.style.top = (curGraphY+blockModel.row) * STEP + "px";
            activeModel.style.left = (curGraphX+blockModel.col) * STEP + "px";
        }
        
    }

    //预览格展示
    function pre_locationBlocks(){
        //生成对应数量的元素
        var preModel = deepClone(pre_curModel);
        for(var item in preModel){
            var divEle1 = document.createElement("div");
            divEle1.className = "pre_box";
            document.getElementById("pre_showBox").appendChild(divEle1);
        }
        var allEle1 = document.getElementsByClassName("pre_box");
        for(var i=0;i<allEle1.length;i++)
        {
            //找到每个元素对应的数据
            var activeModel = allEle1[i];
            var blockModel = preModel[i];
            //根据每个元素对应的数据来指定元素的位置
            //16宫格位置
            //元素在元素内的位置
            activeModel.style.top = (1 + blockModel.row) * STEP + "px";
            activeModel.style.left = (blockModel.col) * STEP + "px";
        }
    }

    //监听用户键盘事件
    function KeyDown(){
        document.onkeydown = function (event){
            //console.log(event.keyCode);
            switch (event.keyCode){
                case 38:
                    //console.log("上");
                    //move(0,-1);
                    rotate();
                    break;
                case 39:
                    //console.log("右");
                    move(1,0);
                    break;
                case 40:
                    //console.log("下");
                    move(0,1);
                    break;
                case 37:
                    //console.log("左");
                    move(-1,0);
                    break;
            }
        }
    }

    //移动
    function move(x,y){
        //碰撞检测
        if (checkTouch(curGraphX+x,curGraphY+y,curModel)){
            if(y!== 0){
                BlockBottom();
            }
            return;
        }
        /* 单位方块移动方法
        var MoveActive = document.getElementsByClassName("box")[0];
        MoveActive.style.top = parseInt(MoveActive.style.top || 0) + y * STEP + "px";
        MoveActive.style.left = parseInt(MoveActive.style.left || 0) + x * STEP + "px";
        */
       //16宫格移动方法
       curGraphX+=x;
       curGraphY+=y;
       //根据16宫格的变量改变位置
       locationBlocks();
    }   

    function rotate(){
        //clone模型
        var cloneCurrentModel = deepClone(curModel);
        /*console.log(cloneCurrentModel);
        console.log(curModel);*/
        //遍历模型
        for (const key in cloneCurrentModel) {
            var blockModel = cloneCurrentModel[key];
            //旋转
            //旋转后的行 = 旋转前的列
            //旋转后的列 = 3 - 旋转前的行
            var temp = blockModel.row;
            blockModel.row = blockModel.col;
            blockModel.col = 3 - temp;
        }

        console.log(cloneCurrentModel);
        console.log(curModel);
        //碰撞检测,可以返回false，不可以返回true
        if(checkTouch(curGraphX,curGraphY,cloneCurrentModel)){
            return;
        }

        //接受旋转指令
        curModel = cloneCurrentModel;
        
        locationBlocks();
    }

    //控制模型只能在边界内移动
    function checkBound(){
        //定义边界
        var leftBound = 0;
        var rightBound = COL_NUM;
        var bottomBound = ROW_NUM;
        
        //边界检测
        for(var key in  curModel){
            //取当前元素进行判定
            var blockModel = curModel[key];
            if((blockModel.col+curGraphX)<0)
            {
                curGraphX++;
            }
            if((blockModel.col+curGraphX)>rightBound)
            {
                curGraphX--;
            }
            if((blockModel.row+curGraphY)>bottomBound)
            {
                curGraphY--;
                BlockBottom();
            }
        }

    }

    //把模型固定在底部
    function BlockBottom(){
        //改变模型样式
        var activeModel = document.getElementsByClassName("box");
        var pre_activeModel = document.getElementsByClassName("pre_box");
        var fixedModel;
        for(var i=activeModel.length-1;i>=0;i--){
            var blockModel = activeModel[i];
            var pre_blockModel = pre_activeModel[i];
            //固定模型（改变类名）
            blockModel.className = "fixed_box";
            pre_blockModel.className = "drop_box";
            //fixedModel：将要被固定的单块元素
            fixedModel = curModel[i]; 
            //fixedBlock：被保存的元素
            fixedBlock[(curGraphY+fixedModel.row)+"_"+(curGraphX+fixedModel.col)] = blockModel;

        }
        /*querySelectAll*/

        //是否有铺满
        isRemoveLine();

        //创建新模型模型
        createModel();
    }

    //判断模型碰撞
    //被占位返回true，可以移动返回false
    function checkTouch(x,y,model){
        //某将要移动到的位置是否已经有数据了
        for (var key in model) {
            var blockModel = model[key];
            //如果能取出元素，就是已经被占位了 
            if (fixedBlock[(y+blockModel.row)+"_"+(x+blockModel.col)]) {
                return true;
            }
        }
        return false;
    }

    //判断一行是否被铺满
    function isRemoveLine(){
        //遍历所有行
        for (var i  = 0; i <= ROW_NUM; i++) {
            //初始化标记符（假设被铺满）
            var flag = true;
            //遍历所有列
            for (var j = 0; j <= COL_NUM; j++) {
                //没有铺满
                if(!fixedBlock[i+"_"+j])
                {
                    flag = false;
                    break;
                }
                
            }
            if(flag){
                //铺满了
                console.log("该行已经被铺满了");
                removeLine(i);
                //统计得分
                MARK = MARK + 1;
                //处理多行
                continue;
            }
        }
    }

    //清理被铺满的行
    function removeLine(line){
        // 遍历该行所有列
        for(var i=0;i<=COL_NUM;i++){
            //删除该行所有的块元素
            document.getElementById("container").removeChild(fixedBlock[line+"_"+i]);
            //删除所有块的数据源
            fixedBlock[line+"_"+i] = null;
        }
        donwStair(line);

    }

    //被清理后元素下降
    function donwStair(line){
        //遍历被清理行之上的所有行
        for (var i = line-1; i >=0; i--) {
            for (var j = 0; j <= COL_NUM; j++) {
                //没有其他数据了
                if(!fixedBlock[i+"_"+j]) continue;
                //存在数据
                //上面行所有元素行数+1
                fixedBlock[(i+1)+"_"+j] = fixedBlock[i+"_"+j];
                //让元素在容器中下降
                fixedBlock[(i+1)+"_"+j].style.top = (i+1) * STEP + "px";
                //清理掉之前的元素
                fixedBlock[i+"_"+j] = null;
            }
        }
    }

    // 模型自动下落
    function autoDown(){
        chooseDifficulty();
        //清空定时器
        if (mInter){
            clearInterval(mInter);
        }
        //重启定时器
        startInter();
        //选择颜色
        chooseColor();

        var s_button = document.getElementById("stop_button");  
        // 监听按钮的点击事件  
        /*s_button.addEventListener("click", function() { 

            // 当标志为true时，暂停游戏，标志修改为false 
            if(CONTINUE_FLAG==true){
                s_button.textContent = '继续游戏'; 
                stopGame();  
                CONTINUE_FLAG = false;
                console.log("游戏暂停了");  
            }
            //再次点击继续游戏
            else if(CONTINUE_FLAG==false){
                s_button.textContent = '暂停游戏'; 
                CONTINUE_FLAG = true;
                autoDown();
                console.log("游戏继续了"); 
            }
        }, false);*/
        s_button.onclick = function(){
        // 当标志为true时，暂停游戏，标志修改为false 
        if(CONTINUE_FLAG==true){
                s_button.textContent = '继续游戏'; 
                stopGame();  
                CONTINUE_FLAG = false;
                console.log("游戏暂停了");  
            }
            //再次点击继续游戏
            else if(CONTINUE_FLAG==false){
                s_button.textContent = '暂停游戏'; 
                CONTINUE_FLAG = true;
                startInter();
                console.log("游戏继续了"); 
            }
        }

    }
    
    //暂停游戏(暂停定时器)
    function stopGame(){
        if(mInter){
            clearInterval(mInter);
        }
    }

    //启动定时器
    function startInter(){
        mInter = setInterval(function(){
                move(0,1);
            }, DOWNSPEED)//600
    }

    //是否结束
    function isGameOver(){
        if(reStart()){
            return false;
        }

        //最上面一行固定元素后-->游戏结束
        for(var i=0;i<=COL_NUM;i++){
            if(fixedBlock["0_"+i]) 
                return true;

        }
        return false;
    }

    //结束游戏
    function gameOver(){
        //1.停止定时器
        if(mInter){
            clearInterval(mInter);
        }
        MARK = MARK * 10;
        alert("游戏结束,您的得分是" + MARK);
        savePlayerScore();
        showedByTable();
    }

    function reStart(){
        var re_button = document.getElementById("reStart_button");    
        re_button.onclick = function(){  
            //stopGame();
            MARK = 0;
            clearBox();
            createModel();  
            KeyDown();     
        }
    }

    //清理全部的模型，包括正在下降的，已经固定的和预览图里的
    function clearBox(){
        // drop_box用于初始化box与pre_box  
        stopGame();
        var boxes = document.getElementsByClassName("box");  
        var preBoxes = document.getElementsByClassName("pre_box");  
        var fixedBoxes = document.getElementsByClassName("fixed_box");
        for(var i = boxes.length-1; i >= 0; i--) { 
            //console.log(boxes.length); 
            boxes[i].className = "drop_box1";
            //console.log(i+"删除成功了");
            }  
        for(var i = preBoxes.length-1; i >= 0; i--) {  
            preBoxes[i].className = "drop_box1";  
            } 
        for(var i = fixedBoxes.length-1; i >= 0; i--) {  
            fixedBoxes[i].className = "drop_box1";  
            }  
        for (var i = ROW_NUM; i >=0; i--) {
            for (var j = 0; j <= COL_NUM; j++) {
                //没有其他数据了
                if(!fixedBlock[i+"_"+j]) continue;
                //存在数据
                //上面行所有元素行数+1
                fixedBlock[i+"_"+j] = null;
                }
        }
    }

    //存储玩家数据
    function savePlayerScore(){
        /*排行榜对象格式
        var leaderBoard = [
        { name: "lty", score: 100 },
        { name: "zz", score: 95 }
            ];*/
        // 获取输入框内容
        var input = document.getElementById('your_name');
        var activePerson = input.value;

        //默认为游客
        if(activePerson ==""){
            activePerson = "游客";
        }

        //创建一个新的对象，包含要添加的用户名称和得分
        var newUser = {name: activePerson, score: MARK};

        // 将新对象添加到 leaderBoard 数组的末尾
        leaderBoard.push(newUser);

        // 反向比较得分，确保最大值在前面
        leaderBoard.sort(function (a, b) {
            return b.score - a.score; 
        });

        //输出检测
        for (var i = 0; i < leaderBoard.length; i++) {
            console.log((i + 1) + ". " + leaderBoard[i].name + ": " + leaderBoard[i].score);
        }

    }

    //用表格展示排行榜
    function showedByTable(){

        var table = document.getElementById("leaderBoardTable");
        var rows = table.rows;
        var cells = table.cells;

        for (var i = 0; i < leaderBoard.length; i++) {
            var cell1 = rows[i].cells[0];//i行0列
            var cell2 = rows[i].cells[1];
            var cell3 = rows[i].cells[2];
            cell1.innerHTML = i + 1; // 排名
            cell2.innerHTML = leaderBoard[i].name; // 用户名
            cell3.innerHTML = leaderBoard[i].score; // 得分
            if(i=leaderBoard.length - 1){
                var row = table.insertRow(-1); // 在表格末尾插入新的行
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                var cell3 = row.insertCell(2);
                cell1.innerHTML = i + 1; // 排名
                cell2.innerHTML = leaderBoard[i].name; // 用户名
                cell3.innerHTML = leaderBoard[i].score; // 得分  
            }
            
        }
    }

    function isTableEmpty(table) {
        var rows = table.rows;
        for (var i = 1; i < rows.length; i++) {
            if (rows[i].cells[0].innerHTML !== '') {
                return false;
            }
        }
        return true;
    }

    //选择难度
    function chooseDifficulty(){
        var radios = document.getElementsByName("difficulty");
        var radio_flag = -1;
        //console.log(radios);
        //console.log(radios.length);
        for (var i = 0; i < radios.length; i++) {
        if(radios[i].checked){
            //console.log("当前选中的难度值为：", radios[i].value)
            radio_flag = i;
        }
    }
        //console.log(radio_flag)
        switch(radio_flag){
            case 0://普通（下降速度600ms）
                DOWNSPEED = 600;
                break;
            case 1://简单（下降速度1s）
                DOWNSPEED = 1000;
                break;
            case 2://困难（下降速度300ms）
                DOWNSPEED = 300;
                break;
                
        }
    }

    //选择颜色
    function chooseColor(){
        //接受单选框的值
        var radios = document.getElementsByName("colorChange");
        var radio_flag = -1;
        for (var i = 0; i < radios.length; i++) {
            if(radios[i].checked){
                //console.log("当前选中的颜色值为：", radios[i].value);
                radio_flag = i;
                }
            }
        //console.log("当前选中的值为：",radio_flag)
        switch(radio_flag){
            case 0://red
                //修改move盒子颜色
                var color_box = document.getElementsByClassName("box");
                for (var i = 0; i < color_box.length; i++) {
                        color_box[i].style.backgroundColor = "#ef82a0";
                    }

                //修改预览盒颜色
                var color_pre_box = document.getElementsByClassName("pre_box");
                for (var i = 0; i < color_pre_box.length; i++) {
                        color_pre_box[i].style.backgroundColor = "#ef82a0";
                    }
                break;

            case 1://yellow
                //修改move盒子颜色
                var color_box = document.getElementsByClassName("box");
                for (var i = 0; i < color_box.length; i++) {
                        color_box[i].style.backgroundColor = "#fbc82f";
                    }

                //修改预览盒颜色
                var color_pre_box = document.getElementsByClassName("pre_box");
                for (var i = 0; i < color_pre_box.length; i++) {
                        color_pre_box[i].style.backgroundColor = "#fbc82f";
                    }
                break;
            
            case 2://blue
                //修改move盒子颜色
                var color_box = document.getElementsByClassName("box");
                for (var i = 0; i < color_box.length; i++) {
                        color_box[i].style.backgroundColor = "#93d5dc";
                    }

                //修改预览盒颜色
                var color_pre_box = document.getElementsByClassName("pre_box");
                for (var i = 0; i < color_pre_box.length; i++) {
                        color_pre_box[i].style.backgroundColor = "#93d5dc";
                    }
                break;
            }

    }

    //选择风格
    function chooseStyle(){
        var radios = document.getElementsByName("styleChange");
        //console.log(radios);
        //console.log(radios.length);
        for (var i = 0; i < radios.length; i++) {
        /*if(radios[i].checked){
            console.log("当前选中的值为：", radios[i].value)
        }*/
        }
    }
