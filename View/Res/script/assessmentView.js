var cacheSelectedRow = null;

  function toggleSubject(e) {
    if (e.target.parentElement != cacheSelectedRow) {
      if (document.getElementsByClassName("trFocused").length > 0) {
        document
          .getElementsByClassName("trFocused")[0]
          .classList.remove("trFocused");
        document.getElementById("dvSubjectTable").style.display = "none";
      }
      e.target.parentElement.classList.add("trFocused");
      document.getElementById("dvSubjectTable").style.display = "initial";
      cacheSelectedRow = e.target.parentElement;
    }
    //load data here later
  }