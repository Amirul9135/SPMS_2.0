
  function selectAssessment(e) {
    if (!e.target.parentElement.classList.contains("bg-primary-gradient")) {
      if (document.getElementsByClassName("bg-primary-gradient").length > 0) {
        var cur = document.getElementsByClassName("bg-primary-gradient")[0];
        cur.classList.remove("bg-primary-gradient");
        cur.classList.remove("text-white");
      }
      e.target.parentElement.classList.add("bg-primary-gradient", "text-white");
    }
  }