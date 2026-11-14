# The Naples Guy — static preview (not the live site)

This is a noindex static export of the local WordPress preview, for review only.
It is **not** thenaplesguy.com and should not be indexed.

- Every HTML page has `<meta name="robots" content="noindex,nofollow">`.
- `robots.txt` disallows all crawlers.
- Contact and email forms do not submit; they show a preview note.

Re-export and publish from the box:

```
bash /workspace/preview/publish-static.sh
```
