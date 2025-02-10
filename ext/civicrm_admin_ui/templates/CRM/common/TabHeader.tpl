{*
 +--------------------------------------------------------------------+
 | Copyright CiviCRM LLC. All rights reserved.                        |
 |                                                                    |
 | This work is published under the GNU AGPLv3 license with some      |
 | permitted exceptions and without any warranty. For full license    |
 | and copyright information, see https://civicrm.org/licensing       |
 +--------------------------------------------------------------------+
*}
{* enclose all tabs and its content in a block *}
<div class="crm-block crm-content-block {$containerClasses|default:''}">
  {if $tabHeader}
    <civi-tabset>
        {foreach from=$tabHeader key=tabName item=tabValue}
          <details>
            <summary
              class="{$tabValue.class|escape}"
              title="{$tabValue.title|escape}"
              disabled="{if $tabValue.active}0{else}1{/if}"
              data-civi-tab-valid="{if $tabValue.valid}1{else}0{/if}"
              {if is_numeric($tabValue.count)}data-civi-tab-count="{$tabValue.count}"{/if}
              {$tabValue.extra}
              >
                <i class="{$tabValue.icon|default:'crm-i fa-puzzle-piece'}" aria-hidden="true"></i>
                <span>{$tabValue.title}</span>
                {if empty($tabValue.hideCount) && is_numeric($tabValue.count)}<em>{$tabValue.count}</em>{/if}
            </summary>

            {if $tabValue.template}
              <div id="{$tabIdPrefix|default:'panel_'}{$tabName}" role="tabpanel">
                {if $tabValue.module}
                  <!-- afform tab - need to pass module and directive to afform param -->
                  {include file=$tabValue.template afform=$tabValue}
                {else}
                  {include file=$tabValue.template}
                {/if}
              </div>
            {else}
              <civi-snippet src="{$tabValue.url|smarty:nodefaults}" lazy-load="1"></civi-snippet>
            {/if}

          </details>

        {/foreach}
    </civi-tabset>
  {/if}
  <div class="clear"></div>
</div>
