# Contribuir / Contributing

[Español](#español) · [English](#english)

## Español

Gracias por querer sumar. El valor de esta lista es que **cada dato se puede comprobar**.

### Reglas

1. **Toda cifra lleva fuente y fecha.** Enlaza la documentación oficial y anota cuándo la comprobaste. Sin fuente, no entra.
2. **Si no se puede comprobar, se marca ⚠️.** No lo des por bueno: indica el motivo (bloquea clientes automáticos, usa JavaScript, la página no existe).
3. **Solo servicios legítimos.** Se excluyen los que hacen ingeniería inversa de chatbots o violan los términos de otros.
4. **Sin enlaces de afiliado** ni promociones.
5. **Los ejemplos de código tienen que funcionar.** Los modelos que cites (`:free` de OpenRouter, tags de Ollama, modelos de Groq) los comprueba `scripts/verificar.py`.
6. Edita **`README.md` y `README.en.md`** con los mismos enlaces.

### Comprobar en local

```bash
python3 -m unittest discover -s tests -p 'test_*.py'   # pruebas del verificador
python3 scripts/verificar.py README.md                   # contrasta el README con las fuentes (usa la red)
scripts/check-parity.sh README.md README.en.md           # mismos enlaces en español e inglés
```

### Qué revisa el CI

Pruebas, ShellCheck, la paridad ES/EN, escaneo de secretos (gitleaks) y ausencia de marcas de agua de IA. Semanalmente, además, `verificar.py` contrasta las afirmaciones con las fuentes reales y la revisión de enlaces (lychee) busca enlaces rotos.

La revisión final es humana y no tiene plazo garantizado. Si usaste un asistente de IA, menciónalo en la descripción del PR; el CI rechaza marcas de agua de IA en archivos y mensajes de commit.

## English

Thanks for wanting to help. The value of this list is that **every fact can be checked**.

### Rules

1. **Every figure carries a source and a date.** Link the official documentation and note when you checked it. No source, no entry.
2. **If it cannot be checked, flag it ⚠️.** Do not take it as good: give the reason (blocks automated clients, uses JavaScript, the page does not exist).
3. **Legitimate services only.** Services that reverse-engineer chatbots or violate others' terms are excluded.
4. **No affiliate links** or promotions.
5. **Code examples must work.** The models you cite (OpenRouter `:free`, Ollama tags, Groq models) are checked by `scripts/verificar.py`.
6. Edit **`README.md` and `README.en.md`** with the same links.

### Check locally

```bash
python3 -m unittest discover -s tests -p 'test_*.py'   # verifier tests
python3 scripts/verificar.py README.md                   # checks the README against the sources (uses the network)
scripts/check-parity.sh README.md README.en.md           # same links in Spanish and English
```

### What CI checks

Tests, ShellCheck, ES/EN parity, secret scanning (gitleaks) and absence of AI watermarks. Weekly, `verificar.py` also checks the claims against the real sources and the link check (lychee) looks for broken links.

The final review is human with no guaranteed turnaround. If you used an AI assistant, say so in the PR description; CI rejects AI watermarks in files and commit messages.
