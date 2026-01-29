<table>
  <thead>
    <tr>
      <th></th>
      <th>{ts}Default{/ts}</th>
      <th>
        {ts}Label{/ts}
        <a class="crm-hover-button crm-options-repeat-sort" title="{ts escape='html'}Sort by label{/ts}">
          <i class="crm-i fa-sort-alpha-down" aria-hidden="true" role="img"></i>
          <span class="sr-only">{ts}Sort by label{/ts}</span>
        </a>
      </th>

      <th>
        {ts}Value{/ts}
        <a class="crm-hover-button crm-options-repeat-sort" title="{ts escape='html'}Sort by value{/ts}">
          <i class="crm-i fa-sort-numeric-down" aria-hidden="true" role="img"></i>
          <span class="sr-only">{ts}Sort by value{/ts}</span>
        </a>
      </th>
      <th>{ts}Enabled{/ts}</th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <a class="crm-draggable">
          <i class="crm-i fa-arrows-up-down" role="img" aria-hidden="true"></i>
          <span class="sr-only">{ts}Change order{/ts}</span>
        </a>
      </td>
      <td><input type="radio" name="is_default" class="crm-form-radio"></td>
      <td><input type="text" name="label" class="crm-form-text required" required></td>
      <td><input type="text" name="value" class="crm-form-text required" required value="1"></td>
      <td><input type="checkbox" name="is_active" class="crm-form-checkbox" checked></td>
      <td>
        <a class="crm-hover-button crm-options-repeat-remove" title="{ts escape='html'}Delete{/ts}">
          <i class="crm-i fa-trash" role="img" aria-hidden="true"></i>
          <span class="sr-only">{ts}Delete{/ts}</span>
        </a>
      </td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td colspan="6">
        <button type="button" class="crm-options-repeat-add">
          <i class="crm-i fa-plus" role="img" aria-hidden="true"></i>
          {ts}Add Option{/ts}
        </button>
      </td>
    </tr>
  </tfoot>
</table>