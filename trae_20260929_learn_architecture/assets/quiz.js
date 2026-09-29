/* ==========================================================================
   quiz.js — 可复用的即时反馈测验组件
   无依赖，可直接在 file:// 下运行。

   用法（HTML 契约）：
   <div class="quiz" data-quiz data-feedback-ok="答对了。（可选）">
     <p class="quiz__question">题干</p>
     <ul class="quiz__options">
       <li><button class="quiz__option" data-correct="true"  data-feedback="为什么对">选项 A</button></li>
       <li><button class="quiz__option" data-correct="false" data-feedback="为什么错">选项 B</button></li>
     </ul>
     <p class="quiz__verdict" hidden></p>
   </div>

   行为约定：
   - 答错：只划掉该选项并立刻给出该选项的反馈，允许继续尝试（retrieval practice）。
   - 答对：锁定该题，给出解释。
   - 页面内所有测验共享进度，写入 id="quiz-progress" 的元素（若存在）。
   ========================================================================== */

(function () {
  "use strict";

  var DEFAULT_OK = "正确。";

  function shuffle(list) {
    for (var i = list.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = list[i];
      list[i] = list[j];
      list[j] = t;
    }
    return list;
  }

  function Quiz(root, onSolved) {
    this.root = root;
    this.onSolved = onSolved;
    this.solved = false;

    var options = Array.prototype.slice.call(root.querySelectorAll(".quiz__option"));
    var verdict = root.querySelector(".quiz__verdict");
    var self = this;

    if (verdict) {
      this.verdict = verdict;
    } else {
      this.verdict = document.createElement("p");
      this.verdict.className = "quiz__verdict";
      this.verdict.hidden = true;
      root.appendChild(this.verdict);
    }

    if (root.dataset.shuffle !== "false" && options.length > 1) {
      var parent = options[0].parentNode;
      shuffle(options).forEach(function (btn) {
        parent.appendChild(btn.closest("li"));
      });
    }

    options.forEach(function (btn) {
      btn.addEventListener("click", function () {
        self.answer(btn);
      });
    });
  }

  Quiz.prototype.say = function (text, kind) {
    this.verdict.textContent = text;
    this.verdict.className = "quiz__verdict quiz__verdict--" + kind;
    this.verdict.hidden = false;
  };

  Quiz.prototype.answer = function (btn) {
    if (this.solved) return;

    var feedback = btn.dataset.feedback || "";

    if (btn.dataset.correct === "true") {
      btn.dataset.state = "right";
      this.solved = true;
      Array.prototype.forEach.call(this.root.querySelectorAll(".quiz__option"), function (o) {
        o.disabled = true;
        if (o !== btn && o.dataset.state !== "wrong") o.dataset.state = "muted";
      });
      this.say(feedback || (this.root.dataset.feedbackOk || DEFAULT_OK), "right");
      if (this.onSolved) this.onSolved();
    } else {
      btn.dataset.state = "wrong";
      btn.disabled = true;
      this.say(feedback || "不对。再想想。", "wrong");
    }
  };

  function init() {
    var roots = Array.prototype.slice.call(document.querySelectorAll("[data-quiz]"));
    if (!roots.length) return;

    var counter = document.getElementById("quiz-progress");
    var solved = 0;

    function update() {
      solved++;
      if (counter) {
        counter.textContent = "已完成 " + solved + " / " + roots.length + " 题";
        if (solved === roots.length) counter.textContent += " — 全部答对，可以进练习了。";
      }
    }

    if (counter) {
      counter.textContent = "已完成 0 / " + roots.length + " 题";
    }

    roots.forEach(function (root) {
      new Quiz(root, update);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();