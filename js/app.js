function save() {
  db.collection("test").add({
    total: Number(total.value),
    time: new Date()
  });
  alert("تم الحفظ");
}
