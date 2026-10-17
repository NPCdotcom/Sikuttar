export function ProfileView() {
  return (
    <section className="view">
      <h1>属性設定</h1>
      <p>あなたの情報を設定できます。</p>

      <div className="card">
        <label htmlFor="occupation">職業・立場</label>
        <select id="occupation" name="occupation" defaultValue="">
          <option value="">選択してください</option>
          <option value="student">学生</option>
          <option value="engineer">エンジニア</option>
          <option value="designer">デザイナー</option>
          <option value="other">その他</option>
        </select>
      </div>

      <p>※ 現在は画面の試作段階です。設定内容はまだ保存されません。</p>
    </section>
  );
}