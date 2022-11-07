import '../../types.d'
import text from './template.html'

export default function(root: ShadowRoot) {
  root.innerHTML = text;
}
