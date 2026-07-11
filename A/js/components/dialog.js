/* ================================================================
   DIALOG component — thin wrapper over window.confirm, kept as its
   own module so a real custom modal can replace it later without
   touching call sites.
   ================================================================ */
function confirmDialog(message){
  return confirm(message);
}
