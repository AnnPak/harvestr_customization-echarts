document.addEventListener("DOMContentLoaded", function(event) { 

  // Charts

  const getResourseForMainChart = () => {

    let idWrapperArr = document.querySelectorAll('[data-type ="product-id"]');

    let productIdArr = [];
    let productNameArr = [];

    idWrapperArr.forEach((el, i) => {
      productIdArr.push(+idWrapperArr[i].getAttribute('data-id'));
      productNameArr.push(idWrapperArr[i].getAttribute('data-name'));
    })

    Promise.all(productIdArr.map(id =>
      fetch(`/mpstats/ajax?id=${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'url': `/mpstats/ajax?id=${id}`,
          "X-CSRF-Token": document.querySelector('input[name=_token]').value
        }
      })
        .then(response => response.json())
        .catch(error => console.log(error))
    ))
      .then(data => {
        setMainChart(data, productNameArr);
        setChartOption(data)

      })

  }

  getResourseForMainChart();

  function getMax(a) {
    return Math.max(...a.map(e => Array.isArray(e) ? getMax(e) : e));
  }

  const setMainChart = (dataArr, productNameArr) => {

    let myChart = echarts.init(document.getElementById('main'));
    let colorArr = ['#5470c6','#91cc75','#fac858','#ee6666','#73c0de','#3ba272','#fc8452','#9a60b4','#ea7ccc', '#01CDFF', '#9966CC']

    //получаем массив используемых месяцев
    let monthArray = dataArr.reduce((newArr, item) => {
      for (let key in item) {
        if (item[key] !== null) {
          newArr.push(key);
        }
      }
      return newArr;
    }, []);

    //делаем в нем уникальные значение
    monthArray = [...new Set(monthArray)];

    //массив с ключом месяцем и суммой выручки
    let arrayWithData = [];
   
    dataArr.forEach((monthArray, i) => {

      arrayWithData[i]=[];
      Object.keys(monthArray).forEach(function (month) {
        let sum = 0;
        monthArray[month].forEach(el => {
          sum = sum +el[1];
        })
        arrayWithData[i][month]=sum;
      });

    })

    //массив с выручкой по продуктам
    let profitsArr = [];
    
    arrayWithData.map((el,i ) => {
      profitsArr[i] = []
      monthArray.forEach((month, index) => {
        profitsArr[i][index] = el[month];
      });
    })

    let seriesData = [];
    seriesData = arrayWithData.map((array, i) => {
      return {
        name: productNameArr[i],
        type: 'bar',
        stack: 'Ad',
        itemStyle: {
          color: colorArr[i],
        },
        emphasis: {
          focus: 'series'
        },
        data: profitsArr[i],
      }
    })

    let option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },

      xAxis: {
        type: 'category',
        data: monthArray,
        axisLine: {
          onZero: false,
        },
      },
      yAxis: {
        type: 'value',
        position: 'left',
        axisLabel: {
          formatter: '{value} M'
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      series: seriesData,

    };

    myChart.setOption(option);
  }


  const setChartOption = (dataArr) => {
    
    const arrayChartWrapp = document.querySelectorAll('.chart-in-table');

    let tableChart = [];

    arrayChartWrapp.forEach((el, i) => {
      tableChart[i] = echarts.init(document.getElementById(el.id));
    })

    let currentMonth = monthsArrayNames[currentMonthNumber].toLowerCase(),
        dataCurrentMonth = [];

    //выбираем массивы нужного месяца

    dataArr.forEach((array, i) => {
      if (typeof array[currentMonth] !== "undefined") {
        dataCurrentMonth[i] = array[currentMonth]
      } else {
        dataCurrentMonth[i] = []
      }
    })

    dataCurrentMonth = dataCurrentMonth.filter(function (el) {
      return el != null;
    });

    //массив дат текущего месяца

    let maxDates = 0;

    dataCurrentMonth.forEach(array => {
      maxDates = maxDates < array.length ? array.length : maxDates;
    })

    let maxProfit = getMax(dataCurrentMonth) + 20000; //максимальная выручка
    let daysArray = Array(maxDates).fill().map((e, i) => i + 1); //максимальное число дней в месяце массиве

    const stateChart = {
      'green': {
        'bg': '#48C158',
        'line': '#0DC51F',
      },
      'red': {
        'bg': '#FD0000',
        'line': '#F51010',
      },
    };

    let optionArray = [];

    tableChart.forEach((el, i) => {

      let currentLineColor, currentBgColor;

      //определение цвета графика
      if (dataCurrentMonth[i][dataCurrentMonth[i].length - 1][1] > dataCurrentMonth[i][dataCurrentMonth[i].length - 2][1]) {

        currentBgColor = stateChart.green.bg;
        currentLineColor = stateChart.green.line;

      } else {
        currentBgColor = stateChart.red.bg;
        currentLineColor = stateChart.red.line;
      }

      optionArray[i] = {
        animation: false,

        tooltip: {
          trigger: 'none',
        },

        axisPointer: {
          show: false,
        },

        xAxis: {
          show: false,
          data: daysArray,

        },
        yAxis: {
          show: false,
          min: 0,
          max: maxProfit,
          position: 'left',

        },

        series: [
          {
            name: 'Money',
            type: 'line',
            smooth: true,
            showSymbol: false,
            data: dataCurrentMonth[i], //массив с данными
            areaStyle: {
              color: currentBgColor
            },
            itemStyle: {
              color: currentLineColor
            },
          },
        ],

      };
    })



    tableChart.forEach((el, i) => {
      el.setOption(optionArray[i]);
    })

  }


})