// When the user is at `/`, there is nothing to render in the `<Outlet/>`. So
// instead of a blank page, routes named `_index` will render inside the outlet.
export default function Index() {
  return (
    <div id="index-page">
      <p>Select a contact from the sidebar to get started.</p>
    </div>
  );
}
