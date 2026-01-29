{*
 +--------------------------------------------------------------------+
 | Copyright CiviCRM LLC. All rights reserved.                        |
 |                                                                    |
 | This work is published under the GNU AGPLv3 license with some      |
 | permitted exceptions and without any warranty. For full license    |
 | and copyright information, see https://civicrm.org/licensing       |
 +--------------------------------------------------------------------+
*}
{* Included in Custom/Form/Field.tpl - used for fields with multiple choice options. *}
<tr>
  <td class="label">{$form.option_type.label} {help id="option_type" file="CRM/Custom/Form/Field"}</td>
  <td class="html-adjust">{$form.option_type.html}</td>
</tr>

<tr id="option_group" {if empty($form.option_group_id)}class="hiddenElement"{/if}>
  <td class="label">{$form.option_group_id.label}</td>
  <td class="html-adjust">{$form.option_group_id.html}</td>
</tr>

<tr id="multiple">
<td colspan="2" class="html-adjust">
  <fieldset>
    <legend>{ts}Multiple Choice Options{/ts}</legend>

    {$form.option_values.html|crmReplace:'type':'hidden'}

    <crm-options-repeat></crm-options-repeat>
  </fieldset>
</td>
</tr>
<script type="text/javascript">

{if !empty($form.option_group_id)}
{literal}
  CRM.$(function($) {
    const $form = $('form.{/literal}{$form.formClass}{literal}');

    function showOptionSelect() {
      const createNewOptions = $('[name="option_type"]:checked', $form).val() === '1';
      $('#multiple').toggle(createNewOptions);
      $('#option_group').toggle(!createNewOptions);
    }

    $('[name="option_type"]', $form).on('change', showOptionSelect);
    showOptionSelect();
  });
{/literal}
{/if}
</script>


