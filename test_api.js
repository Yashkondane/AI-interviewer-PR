async function test() {
  const code = 'print("hello world")';
  try {
      const res = await fetch('https://onecompiler.com/api/code/exec', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              properties: {
                  language: 'python',
                  files: [{ name: 'main.py', content: code }],
                  stdin: ''
              }
          })
      });
      const data = await res.text();
      console.log('STATUS:', res.status);
      console.log('DATA:', data);
  } catch (e) {
      console.error(e.message);
  }
}
test();
