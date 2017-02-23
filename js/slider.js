/**
 * Slider
 *
 * @example $("#slider-wrapper").slider();
 * @description js滑块插件
 */

  (function (win, $) {
      $.fn.slider = function () {
          var wrapper = $(this),
              handle = wrapper.find(".handle");

          if (!wrapper.length || !handle.length) {
              throw new Error("Slider initialize failed: wrapper or handle node must be exist...");
          }

          // 轨迹点
          var locus = [];
          var mobile = isMobile();
          // 优化性能，每隔20毫秒记录一次鼠标移动坐标
          var looper, interval = 20;
          // 鼠标坐标信息
          var pointerX, pointerY, pointerTo, pointerTime;

          function isMobile () {
              return Boolean(navigator.userAgent.toLowerCase().match(/mobile/i));
          }

          function getEventObj (e) {
              // 返回jQuery包装过的原生event对象
              var obj = (e && e.originalEvent) || win.event;
              // 兼容触摸屏移动端
              return (mobile && obj.touches) ? obj.touches[0] : obj;
          }

          function getIndex (data, param, value) {
              for (var i = 0, l = data.length; i < l; i++) {
                  if (data[i][param] === value) {
                      return i;
                  }
              }
              return -1;
          }

          // 速度比较，预设阈值
          function speedCompare (speedA, speedB) {
              var threshold = 0.2;
              return Math.abs(speedA - speedB) < threshold;
          }

          // 计算速度，公式：距离/时间
          function calculateSpeed (item, prevItem) {
              return ((Math.abs(item.position - prevItem.position)) / (item.date - prevItem.date)).toFixed(2);
          }

          function calculateLocus () {
              var speedLocus = [];
              for (var i = 0, l = locus.length; i < l; i++) {
                  var locusItem = locus[i], prevLocusItem = locus[i - 1];
                  if (prevLocusItem) {
                      locusItem.speed = calculateSpeed(locusItem, prevLocusItem);
                      // 速度发生变化
                      if (!speedCompare(locusItem.speed, prevLocusItem.speed)) {
                          speedLocus[speedLocus.length] = {
                              x: locusItem.x,
                              y: locusItem.y
                          };
                      }
                  } else {
                      locusItem.speed = 0;
                  }
              }
              return speedLocus;
          }

          function onHandleDown (e) {
              var e = getEventObj(e);
              var x = e.clientX, y = e.clientY;
              var l = this.offsetLeft;
              var max = wrapper[0].offsetWidth - this.offsetWidth;

              startLooper();

              function onDocumentMove (e) {
                  var e = getEventObj(e);
                  pointerTime = new Date().getTime();
                  pointerX = e.clientX, pointerY = e.clientY;
                  pointerTo = Math.min(max, Math.max(0, l + (pointerX - x)));
                  handle.css({
                      "left": pointerTo + "px"
                  });
              }

              function onDocumentUp (e) {
                  if (mobile) {
                      $(this).off("touchmove").off("touchend");
                  } else {
                      $(this).off("mousemove").off("mouseup");
                  }

                  // 输出速度变化轨迹点
                  locus = calculateLocus();
                  console.log(JSON.stringify(locus));
                  locus = [];

                  endLooper();
              }

              if (mobile) {
                  $(document).on("touchmove", onDocumentMove).on("touchend", onDocumentUp);
              } else {
                  $(document).on("mousemove", onDocumentMove).on("mouseup", onDocumentUp);
              }
          }

          function bindEvent () {
              if (mobile) {
                  handle.on("touchstart", onHandleDown);
              } else {
                  handle.on("mousedown", onHandleDown);
              }
          }

          function recordLocus () {
              // 根据坐标去重
              var index = getIndex(locus, "position", pointerTo);
              if (pointerTime && index === -1) {
                  locus[locus.length] = {
                      x: pointerX,
                      y: pointerY,
                      date: pointerTime,
                      position: pointerTo
                  };
              }
          }

          function startLooper () {
              looper = setInterval(recordLocus, interval);
          }

          function endLooper () {
              clearInterval(looper);
          }

          bindEvent();
      };
  })(Window, jQuery);
