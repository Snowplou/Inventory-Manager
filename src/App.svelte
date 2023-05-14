<script>
  import { data, addDbCallback, getFromDb } from "./db";

  addDbCallback(() => {
    console.log($data);
  })
</script>